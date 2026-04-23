# -*- coding: utf-8 -*-
"""AI 治理决策 API。"""

from flask import Blueprint, jsonify, request

from services.decision_service import DecisionService

decision_bp = Blueprint("decision", __name__)


@decision_bp.route("/generate", methods=["POST"])
def generate_decision():
    try:
        payload = request.get_json(silent=True) or {}
        province = (payload.get("province") or "").strip()
        date = payload.get("date")
        model_type = payload.get("model_type", "LSTM")
        force_refresh = bool(payload.get("force_refresh", False))
        if not province:
            return jsonify({"success": False, "error": "缺少 province 参数"}), 400

        service = DecisionService()
        try:
            data = service.generate_decision(
                province=province,
                date=date,
                model_type=model_type,
                force_refresh=force_refresh,
            )
            return jsonify({"success": True, "data": data}), 200
        finally:
            service.close()
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@decision_bp.route("/history", methods=["GET"])
def get_decision_history():
    try:
        province = (request.args.get("province", "") or "").strip()
        limit = int(request.args.get("limit", "10"))
        if not province:
            return jsonify({"success": False, "error": "缺少 province 参数"}), 400

        service = DecisionService()
        try:
            rows = service.get_decision_history(province, limit)
            data = [
                {
                    "id": row["id"],
                    "province": row["region_name"],
                    "date": str(row["generate_time"]),
                    "model_type": row["model_type"],
                    "report_summary": (
                        row["report_content"][:200] + "..."
                        if row["report_content"] and len(row["report_content"]) > 200
                        else (row["report_content"] or "")
                    ),
                    "created_at": str(row["created_at"]),
                }
                for row in rows
            ]
            return jsonify({"success": True, "data": data}), 200
        finally:
            service.close()
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@decision_bp.route("/comparison", methods=["GET"])
def get_comparison_data():
    try:
        province = (request.args.get("province", "") or "").strip()
        model_type = request.args.get("model_type", "LSTM")
        end_date = (request.args.get("end_date", "") or "").strip() or None
        days_arg = (request.args.get("days", "") or "").strip()
        if not province:
            return jsonify({"success": False, "error": "缺少 province 参数"}), 400

        service = DecisionService()
        try:
            prediction_window = service.get_prediction_window(province, model_type)
            analysis_end = end_date or prediction_window["end_date"]
            days = int(days_arg) if days_arg else None
            prediction = service.get_prediction_trend(
                province,
                model_type=model_type,
                days=days,
                end_date=analysis_end if days else None,
                start_date=prediction_window["start_date"] if not days else None,
            )
            if prediction:
                history = service.get_historical_trend(
                    province,
                    days=days,
                    end_date=analysis_end if days else None,
                    start_date=prediction[0]["date"] if not days else None,
                )
            else:
                history = []

            all_dates = sorted({row["date"] for row in history} | {row["date"] for row in prediction})

            def fill(rows):
                mapping = {row["date"]: row for row in rows}
                return {
                    field: [mapping.get(day, {}).get(field) for day in all_dates]
                    for field in ("dissolved_oxygen", "ammonia_nitrogen", "total_phosphorus", "permanganate_index")
                }

            return jsonify(
                {
                    "success": True,
                    "data": {
                        "province": province,
                        "model_type": model_type.upper(),
                        "dates": all_dates,
                        "historical": fill(history),
                        "prediction": fill(prediction),
                        "prediction_range": {
                            "start_date": prediction[0]["date"] if prediction else prediction_window["start_date"],
                            "end_date": prediction[-1]["date"] if prediction else analysis_end,
                            "day_count": len(prediction),
                            "full_day_count": prediction_window["day_count"],
                        },
                        "historical_range": {
                            "start_date": history[0]["date"] if history else None,
                            "end_date": history[-1]["date"] if history else None,
                            "day_count": len(history),
                        },
                    },
                }
            ), 200
        finally:
            service.close()
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@decision_bp.route("/context", methods=["GET"])
def get_decision_context():
    try:
        province = (request.args.get("province", "") or "").strip()
        date = request.args.get("date")
        model_type = request.args.get("model_type", "LSTM")
        if not province:
            return jsonify({"success": False, "error": "缺少 province 参数"}), 400

        service = DecisionService()
        try:
            context = service.build_context(province, date, model_type)
            prompt = service.generate_prompt(context)
            return jsonify({"success": True, "data": {"context": context, "prompt": prompt}}), 200
        finally:
            service.close()
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500
