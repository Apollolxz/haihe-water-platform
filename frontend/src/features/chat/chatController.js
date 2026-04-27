import { resolveApiUrl } from '../../config/runtime.js';

let activeController = null;

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem('chatHistory')) || [];
  } catch {
    return [];
  }
}

function saveToHistory(message) {
  const history = readHistory();
  history.unshift({ message, timestamp: new Date().toLocaleString() });
  localStorage.setItem('chatHistory', JSON.stringify(history.slice(0, 10)));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPlainAnswer(message) {
  return String(message ?? '')
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[a-zA-Z0-9_-]*\n?/g, '').replace(/```/g, ''))
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function renderText(message) {
  return escapeHtml(formatPlainAnswer(message)).replace(/\n/g, '<br>');
}

function createUserMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message user-message';
  messageDiv.innerHTML = `
    <div class="flex items-start space-x-3 justify-end">
      <div>
        <p class="text-sm">${renderText(message)}</p>
      </div>
      <div class="w-8 h-8 rounded-full bg-gradient-eco flex items-center justify-center flex-shrink-0">
        <i class="fa fa-user text-white"></i>
      </div>
    </div>
  `;
  return messageDiv;
}

function createBotMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message bot-message';
  messageDiv.innerHTML = `
    <div class="flex items-start space-x-3">
      <div class="w-8 h-8 rounded-full bg-gradient-eco flex items-center justify-center flex-shrink-0 animate-glow">
        <i class="fa fa-robot text-white"></i>
      </div>
      <div>
        <p class="text-sm leading-7">${renderText(message)}</p>
        <div class="mt-1 text-xs text-gray-400 flex items-center">
          <i class="fa fa-bolt mr-1"></i>
          <span>DeepSeek 智能分析</span>
        </div>
      </div>
    </div>
  `;
  return messageDiv;
}

function createTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message bot-message';
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `
    <div class="flex items-start space-x-3">
      <div class="w-8 h-8 rounded-full bg-gradient-eco flex items-center justify-center flex-shrink-0 animate-glow">
        <i class="fa fa-robot text-white"></i>
      </div>
      <div>
        <div class="text-sm text-text-light mb-2">思考中...</div>
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot" style="animation-delay: 0.2s"></div>
          <div class="typing-dot" style="animation-delay: 0.4s"></div>
        </div>
      </div>
    </div>
  `;
  return typingDiv;
}

async function callChatApi(message) {
  const token = localStorage.getItem('token') || '';
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(resolveApiUrl('/api/chat/test-deepseek'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ question: message }),
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data.data?.answer || '';
}

function initParticleBackground() {
  if (typeof window.particlesJS !== 'function' || !document.getElementById('particles-js')) {
    return undefined;
  }

  window.particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#06b6d4' },
      shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
      opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
      size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
      line_linked: { enable: true, distance: 150, color: '#06b6d4', opacity: 0.4, width: 1 },
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

export function initChatPageInteractions() {
  activeController?.();

  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const messageInput = document.getElementById('messageInput');
  const historyList = document.getElementById('historyList');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const hotQuestionButtons = [...document.querySelectorAll('.hot-question')];

  if (!chatMessages || !chatForm || !messageInput || !historyList) {
    return undefined;
  }

  const initialMessagesHtml = chatMessages.innerHTML;
  const cleanupParticles = initParticleBackground();

  const scrollToBottom = () => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const addMessage = (message, type) => {
    chatMessages.appendChild(type === 'user' ? createUserMessage(message) : createBotMessage(message));
    scrollToBottom();
  };

  const showTyping = () => {
    chatMessages.appendChild(createTypingIndicator());
    scrollToBottom();
  };

  const hideTyping = () => {
    document.getElementById('typingIndicator')?.remove();
  };

  const loadHistoryList = () => {
    const history = readHistory();
    if (history.length === 0) {
      historyList.innerHTML = '<div class="text-sm text-gray-500 italic">暂无历史记录</div>';
      return;
    }

    historyList.innerHTML = '';
    history.forEach((item) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'p-2 hover:bg-dark-lighter rounded cursor-pointer transition-colors';
      historyItem.innerHTML = `
        <p class="text-sm text-gray-300 line-clamp-1">${escapeHtml(item.message)}</p>
        <p class="text-xs text-gray-500">${escapeHtml(item.timestamp)}</p>
      `;
      historyItem.addEventListener('click', () => sendMessage(item.message));
      historyList.appendChild(historyItem);
    });
  };

  async function sendMessage(message) {
    addMessage(message, 'user');
    saveToHistory(message);
    loadHistoryList();
    showTyping();

    try {
      const answer = await callChatApi(message);
      hideTyping();
      addMessage(answer, 'bot');
    } catch (error) {
      hideTyping();
      console.error('Chat API Error:', error);
      addMessage(`抱歉，服务暂时不可用。错误信息：${error.message || '未知错误'}`, 'bot');
    }
  }

  const onSubmit = (event) => {
    event.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;
    sendMessage(message);
    messageInput.value = '';
  };

  const hotQuestionHandlers = hotQuestionButtons.map((button) => {
    const handler = () => sendMessage(button.textContent.trim());
    button.addEventListener('click', handler);
    return [button, handler];
  });

  const onClearChat = () => {
    if (!window.confirm('确定要清空聊天记录吗？')) return;
    chatMessages.innerHTML = initialMessagesHtml;
    localStorage.removeItem('chatHistory');
    loadHistoryList();
  };

  chatForm.addEventListener('submit', onSubmit);
  clearChatBtn?.addEventListener('click', onClearChat);
  loadHistoryList();

  activeController = () => {
    chatForm.removeEventListener('submit', onSubmit);
    clearChatBtn?.removeEventListener('click', onClearChat);
    hotQuestionHandlers.forEach(([button, handler]) => button.removeEventListener('click', handler));
    cleanupParticles?.();
    activeController = null;
  };

  return activeController;
}
