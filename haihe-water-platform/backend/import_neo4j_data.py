#!/usr/bin/env python3
"""
导入知识图谱数据到Neo4j数据库
使用方法: python import_neo4j_data.py
"""

from neo4j import GraphDatabase
import os
from dotenv import load_dotenv
from utils.neo4j_helper import get_neo4j_config

# 加载环境变量
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'), override=False)

def get_neo4j_driver():
    """
    获取Neo4j数据库连接
    
    Returns:
        Neo4j驱动对象
    """
    config = get_neo4j_config()
    uri = config['uri']
    user = config['user']
    password = config['password']
    
    print(f"连接Neo4j数据库: {uri}")
    print(f"用户名: {user}")
    print(f"密码: {password}")
    
    # 创建并返回数据库驱动
    return GraphDatabase.driver(uri, auth=(user, password))

def create_knowledge_graph():
    """
    创建知识图谱数据
    """
    driver = get_neo4j_driver()
    
    try:
        with driver.session() as session:
            # 清空现有数据
            print("清空现有数据...")
            session.run("MATCH (n) DETACH DELETE n")
            print("数据清空完成")
            
            # 创建节点
            print("创建节点...")
            
            # 污水处理工艺节点
            processes = [
                ("活性污泥法", "污水处理工艺", "活性污泥法是一种污水的好氧生物处理法，由Edward Ardern和William Lockett于1914年首先在英国发明。该方法是利用微生物（主要是细菌）分解水中的有机物，通过曝气提供氧气，使微生物在有氧条件下分解有机物，形成活性污泥，然后通过沉淀分离污泥和清水。"),
                ("A²O工艺", "污水处理工艺", "A²O工艺是厌氧-缺氧-好氧组合工艺的简称，是一种常用的污水处理工艺。该工艺能同时去除污水中的有机物、氮和磷，具有处理效果好、运行稳定等优点。"),
                ("SBR工艺", "污水处理工艺", "SBR工艺是序批式活性污泥法的简称，是一种按间歇曝气方式来运行的活性污泥污水处理技术。它的主要特征是在运行上的有序和间歇操作，SBR技术的核心是SBR反应池，该池集均化、初沉、生物降解、二沉等功能于一池，无污泥回流系统。"),
                ("MBR工艺", "污水处理工艺", "MBR工艺是膜生物反应器的简称，是将膜分离技术与生物处理技术相结合的一种新型污水处理工艺。MBR工艺具有出水水质好、占地面积小、剩余污泥少等优点。")
            ]
            
            for name, type_, description in processes:
                session.run(
                    "CREATE (p:Process {name: $name, type: $type, description: $description})",
                    name=name, type=type_, description=description
                )
            
            # 水质指标节点
            indicators = [
                ("COD", "水质指标", "COD（化学需氧量）是指在一定条件下，用强氧化剂氧化水中有机物所消耗的氧量，是衡量水体中有机物污染程度的重要指标。COD值越高，说明水体受有机物污染越严重。"),
                ("氨氮", "水质指标", "氨氮是指水中以游离氨（NH3）和铵离子（NH4+）形式存在的氮。氨氮是水体中的营养素，可导致水体富营养化现象产生，是水体中的主要耗氧污染物，对鱼类及某些水生生物有毒害。"),
                ("总磷", "水质指标", "总磷是水样经消解后将各种形态的磷转变成正磷酸盐后测定的结果，以每升水样含磷毫克数计量。总磷是衡量水体富营养化的重要指标之一。"),
                ("总氮", "水质指标", "总氮是指水中各种形态的氮的总和，包括有机氮、氨氮、亚硝酸盐氮和硝酸盐氮。总氮是衡量水体富营养化的重要指标之一。"),
                ("pH值", "水质指标", "pH值是衡量水体酸碱度的重要指标。对于污水处理来说，适宜的pH值范围一般为6.5-8.5，在此范围内微生物的活性最高。"),
                ("溶解氧", "水质指标", "溶解氧是指溶解在水中的分子态氧，是衡量水体自净能力的重要指标。对于好氧生物处理工艺，溶解氧一般应保持在2-4mg/L之间。")
            ]
            
            for name, type_, description in indicators:
                session.run(
                    "CREATE (i:Indicator {name: $name, type: $type, description: $description})",
                    name=name, type=type_, description=description
                )
            
            # 处理设备节点
            equipment = [
                ("曝气池", "处理设备", "曝气池是活性污泥法处理工艺的核心设备，通过曝气装置向池中通入空气，为微生物提供氧气，同时搅拌混合液，使微生物与有机物充分接触。"),
                ("沉淀池", "处理设备", "沉淀池是用于分离活性污泥和处理水的设备，使活性污泥沉淀，上清液作为处理水排出，沉淀的污泥部分回流到曝气池，部分作为剩余污泥排出。"),
                ("过滤池", "处理设备", "过滤池是用于进一步去除水中悬浮物的设备，通过过滤介质（如石英砂、活性炭等）截留水中的悬浮物，提高出水水质。"),
                ("消毒池", "处理设备", "消毒池是用于杀灭水中病原微生物的设备，常用的消毒方法包括氯消毒、紫外线消毒、臭氧消毒等。")
            ]
            
            for name, type_, description in equipment:
                session.run(
                    "CREATE (e:Equipment {name: $name, type: $type, description: $description})",
                    name=name, type=type_, description=description
                )
            
            # 监测技术节点
            monitoring = [
                ("在线监测", "监测技术", "在线监测是指通过自动化仪器设备对水质参数进行实时监测，能够及时掌握水质变化情况，为污水处理工艺调整提供依据。"),
                ("实验室分析", "监测技术", "实验室分析是指通过实验室仪器设备对水样进行分析，能够提供准确的水质数据，是水质监测的重要手段。"),
                ("生物监测", "监测技术", "生物监测是指通过观察水生生物的种类、数量和行为等指标来监测水质，能够反映水质的综合状况。")
            ]
            
            for name, type_, description in monitoring:
                session.run(
                    "CREATE (m:Monitoring {name: $name, type: $type, description: $description})",
                    name=name, type=type_, description=description
                )
            
            # 污染物节点
            pollutants = [
                ("有机物", "污染物", "有机物是指含有碳元素的化合物，是水体中的主要污染物之一，主要来源于生活污水、工业废水和农业面源污染。"),
                ("氮", "污染物", "氮是水体中的重要污染物之一，主要来源于生活污水、农业面源污染和工业废水，可导致水体富营养化。"),
                ("磷", "污染物", "磷是水体中的重要污染物之一，主要来源于生活污水、农业面源污染和工业废水，可导致水体富营养化。"),
                ("重金属", "污染物", "重金属是指密度大于4.5g/cm³的金属，如铅、镉、汞、铬等，是水体中的有毒污染物，主要来源于工业废水和采矿废水。")
            ]
            
            for name, type_, description in pollutants:
                session.run(
                    "CREATE (p:Pollutant {name: $name, type: $type, description: $description})",
                    name=name, type=type_, description=description
                )
            
            print("节点创建完成")
            
            # 创建关系
            print("创建关系...")
            
            # 工艺与指标的关系
            process_indicator_relations = [
                ("活性污泥法", "COD", "去除"),
                ("活性污泥法", "氨氮", "去除"),
                ("活性污泥法", "总磷", "去除"),
                ("A²O工艺", "COD", "去除"),
                ("A²O工艺", "氨氮", "去除"),
                ("A²O工艺", "总磷", "去除"),
                ("A²O工艺", "总氮", "去除"),
                ("SBR工艺", "COD", "去除"),
                ("SBR工艺", "氨氮", "去除"),
                ("SBR工艺", "总磷", "去除"),
                ("MBR工艺", "COD", "去除"),
                ("MBR工艺", "氨氮", "去除"),
                ("MBR工艺", "总磷", "去除"),
                ("MBR工艺", "总氮", "去除")
            ]
            
            for process_name, indicator_name, relation in process_indicator_relations:
                session.run(
                    "MATCH (p:Process {name: $process_name}), (i:Indicator {name: $indicator_name}) "
                    "CREATE (p)-[r:REMOVES]->(i) SET r.type = $relation",
                    process_name=process_name, indicator_name=indicator_name, relation=relation
                )
            
            # 工艺与设备的关系
            process_equipment_relations = [
                ("活性污泥法", "曝气池", "使用"),
                ("活性污泥法", "沉淀池", "使用"),
                ("A²O工艺", "曝气池", "使用"),
                ("A²O工艺", "沉淀池", "使用"),
                ("SBR工艺", "曝气池", "使用"),
                ("SBR工艺", "沉淀池", "使用"),
                ("MBR工艺", "曝气池", "使用"),
                ("MBR工艺", "过滤池", "使用")
            ]
            
            for process_name, equipment_name, relation in process_equipment_relations:
                session.run(
                    "MATCH (p:Process {name: $process_name}), (e:Equipment {name: $equipment_name}) "
                    "CREATE (p)-[r:USES]->(e) SET r.type = $relation",
                    process_name=process_name, equipment_name=equipment_name, relation=relation
                )
            
            # 工艺与监测的关系
            process_monitoring_relations = [
                ("活性污泥法", "在线监测", "需要"),
                ("A²O工艺", "在线监测", "需要"),
                ("SBR工艺", "在线监测", "需要"),
                ("MBR工艺", "在线监测", "需要")
            ]
            
            for process_name, monitoring_name, relation in process_monitoring_relations:
                session.run(
                    "MATCH (p:Process {name: $process_name}), (m:Monitoring {name: $monitoring_name}) "
                    "CREATE (p)-[r:REQUIRES]->(m) SET r.type = $relation",
                    process_name=process_name, monitoring_name=monitoring_name, relation=relation
                )
            
            # 指标与污染物的关系
            indicator_pollutant_relations = [
                ("COD", "有机物", "衡量"),
                ("氨氮", "氮", "衡量"),
                ("总氮", "氮", "衡量"),
                ("总磷", "磷", "衡量")
            ]
            
            for indicator_name, pollutant_name, relation in indicator_pollutant_relations:
                session.run(
                    "MATCH (i:Indicator {name: $indicator_name}), (p:Pollutant {name: $pollutant_name}) "
                    "CREATE (i)-[r:MEASURES]->(p) SET r.type = $relation",
                    indicator_name=indicator_name, pollutant_name=pollutant_name, relation=relation
                )
            
            print("关系创建完成")
            print("知识图谱数据导入成功！")
            
    finally:
        driver.close()

if __name__ == "__main__":
    create_knowledge_graph()
