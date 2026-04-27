import { resolveApiUrl } from '../../config/runtime.js';
import { pageBase } from '../../legacy/routing.js';

let activeCleanup = null;

function $(id) {
  return document.getElementById(id);
}

function initParticleBackground() {
  if (typeof window.particlesJS !== 'function' || !$('particles-js')) {
    return undefined;
  }

  window.particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#0ea5e9' },
      shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
      opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
      size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
      line_linked: { enable: true, distance: 150, color: '#0ea5e9', opacity: 0.4, width: 1 },
      move: { enable: true, speed: 1, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'repulse' },
        onclick: { enable: true, mode: 'push' },
        resize: true,
      },
      modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } },
    },
    retina_detect: true,
  });

  return () => {
    const instance = window.pJSDom?.find?.((item) => item?.pJS?.canvas?.el?.parentElement?.id === 'particles-js');
    instance?.pJS?.fn?.vendors?.destroypJS?.();
  };
}

function bindPasswordToggle(inputId) {
  const toggleButton = $('togglePassword');
  const passwordInput = $(inputId);
  if (!toggleButton || !passwordInput) return undefined;

  const onClick = () => {
    const icon = toggleButton.querySelector('i');
    const shouldShow = passwordInput.type === 'password';
    passwordInput.type = shouldShow ? 'text' : 'password';
    icon?.classList.toggle('fa-eye-slash', !shouldShow);
    icon?.classList.toggle('fa-eye', shouldShow);
  };

  toggleButton.addEventListener('click', onClick);
  return () => toggleButton.removeEventListener('click', onClick);
}

function bindVerificationCodeButton() {
  const sendCodeBtn = $('sendCodeBtn');
  const emailInput = $('email');
  if (!sendCodeBtn || !emailInput) return undefined;

  let timer;
  const initialText = sendCodeBtn.textContent;

  const onClick = () => {
    const email = emailInput.value.trim();
    if (!email) {
      window.alert('请先输入邮箱');
      return;
    }

    sendCodeBtn.disabled = true;
    let countdown = 60;
    sendCodeBtn.textContent = '60s后重发';

    timer = window.setInterval(() => {
      countdown -= 1;
      sendCodeBtn.textContent = `${countdown}s后重发`;

      if (countdown <= 0) {
        window.clearInterval(timer);
        sendCodeBtn.disabled = false;
        sendCodeBtn.textContent = initialText || '发送验证码';
      }
    }, 1000);

    window.alert(`邮箱验证码已发送至 ${email}`);
  };

  sendCodeBtn.addEventListener('click', onClick);

  return () => {
    sendCodeBtn.removeEventListener('click', onClick);
    window.clearInterval(timer);
    sendCodeBtn.disabled = false;
    sendCodeBtn.textContent = initialText;
  };
}

async function postAuth(path, body) {
  const response = await fetch(resolveApiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
}

function initLoginPage() {
  const form = $('loginForm');
  if (!form) return undefined;

  const onSubmit = async (event) => {
    event.preventDefault();
    const username = $('username')?.value.trim();
    const password = $('password')?.value;

    if (!username || !password) {
      window.alert('请输入账号和密码');
      return;
    }

    try {
      const data = await postAuth('/api/auth/login', { username, password });
      const user = data.data?.user || {};
      const userInfo = {
        username: user.username,
        email: user.email,
        tag: user.tag,
        role: user.role,
      };

      localStorage.setItem('currentUser', JSON.stringify(userInfo));
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('token', data.data?.token || '');
      window.location.href = `${pageBase}index.html`;
    } catch (error) {
      window.alert(error.message || '登录失败，请检查账号和密码');
      console.error('登录错误:', error);
    }
  };

  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}

function initRegisterPage() {
  const form = $('registerForm');
  if (!form) return undefined;

  const onSubmit = async (event) => {
    event.preventDefault();
    const username = $('username')?.value.trim();
    const password = $('password')?.value;
    const confirmPassword = $('confirmPassword')?.value;
    const email = $('email')?.value.trim();
    const verificationCode = $('verificationCode')?.value.trim();
    const tag = document.querySelector('input[name="tag"]:checked')?.value;
    const agreeTerms = $('agreeTerms')?.checked;

    if (!username || !password || !confirmPassword || !email || !verificationCode || !tag || !agreeTerms) {
      window.alert('请填写所有必填项');
      return;
    }

    if (password !== confirmPassword) {
      window.alert('两次输入的密码不一致');
      return;
    }

    if (verificationCode !== '123456') {
      window.alert('验证码错误');
      return;
    }

    try {
      await postAuth('/api/auth/register', { username, password, email, tag });
      window.alert('账号创建成功，请登录海河六域');
      window.location.href = `${pageBase}login.html`;
    } catch (error) {
      window.alert(error.message || '注册失败，请检查输入信息');
      console.error('注册错误:', error);
    }
  };

  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}

function initForgotPasswordPage() {
  const form = $('forgotPasswordForm');
  if (!form) return undefined;

  const onSubmit = async (event) => {
    event.preventDefault();
    const email = $('email')?.value.trim();
    const verificationCode = $('verificationCode')?.value.trim();
    const newPassword = $('newPassword')?.value;
    const confirmPassword = $('confirmPassword')?.value;

    if (!email || !verificationCode || !newPassword || !confirmPassword) {
      window.alert('请填写所有必填项');
      return;
    }

    if (newPassword !== confirmPassword) {
      window.alert('两次输入的密码不一致');
      return;
    }

    if (verificationCode !== '123456') {
      window.alert('验证码错误');
      return;
    }

    try {
      await postAuth('/api/auth/reset-password', { email, new_password: newPassword });
      window.alert('密码重置成功，请重新登录海河六域');
      window.location.href = `${pageBase}login.html`;
    } catch (error) {
      window.alert(error.message || '密码重置失败，请检查输入信息');
      console.error('密码重置错误:', error);
    }
  };

  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}

export function initAuthPageInteractions(pageName) {
  activeCleanup?.();

  const cleanups = [
    initParticleBackground(),
    bindPasswordToggle(pageName === 'forgot-password.html' ? 'newPassword' : 'password'),
  ];

  if (pageName === 'login.html') {
    cleanups.push(initLoginPage());
  }

  if (pageName === 'register.html') {
    cleanups.push(bindVerificationCodeButton(), initRegisterPage());
  }

  if (pageName === 'forgot-password.html') {
    cleanups.push(bindVerificationCodeButton(), initForgotPasswordPage());
  }

  activeCleanup = () => {
    cleanups.forEach((cleanup) => cleanup?.());
    activeCleanup = null;
  };

  return activeCleanup;
}
