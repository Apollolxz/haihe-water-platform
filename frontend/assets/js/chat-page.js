'use strict';

(function () {
  let initializedForm = null;

  function addMessage(message, type) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages || !window.chatMessage) return;

    const messageElement = type === 'user'
      ? window.chatMessage.createUserMessage(message)
      : window.chatMessage.createBotMessage(message);

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages || !window.chatMessage) return;

    const typingElement = window.chatMessage.createTypingIndicator();
    chatMessages.appendChild(typingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function loadHistoryList() {
    const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    if (history.length === 0) {
      historyList.innerHTML = '<div class="text-sm text-gray-500 italic">暂无历史记录</div>';
      return;
    }

    historyList.innerHTML = '';
    history.forEach((item) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'p-2 hover:bg-dark-lighter rounded cursor-pointer transition-colors';
      historyItem.innerHTML = `
        <p class="text-sm text-gray-300 line-clamp-1">${window.chatMessage.escapeHtml(item.message)}</p>
        <p class="text-xs text-gray-500">${window.chatMessage.escapeHtml(item.timestamp)}</p>
      `;
      historyItem.addEventListener('click', () => {
        sendMessage(item.message);
      });
      historyList.appendChild(historyItem);
    });
  }

  async function sendMessage(message) {
    addMessage(message, 'user');
    window.chatUtils?.saveToHistory(message);
    loadHistoryList();
    showTyping();

    try {
      const token = window.chatService?.getToken() || '';
      const answer = await window.chatService.callChatAPI(message, token);
      window.chatMessage?.hideTypingIndicator();
      addMessage(answer, 'bot');
    } catch (error) {
      window.chatMessage?.hideTypingIndicator();
      console.error('Chat API Error:', error);
      addMessage(`抱歉，服务暂时不可用。错误信息：${error.message || '未知错误'}`, 'bot');
    }
  }

  function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.innerHTML = `
        <div class="chat-message bot-message">
          <div class="flex items-start space-x-3">
            <div class="w-8 h-8 rounded-full bg-gradient-eco flex items-center justify-center flex-shrink-0 animate-glow">
              <i class="fa fa-robot text-white"></i>
            </div>
            <div>
              <p class="text-sm">您好！我是流域智能问答助手，为您解答页面使用、指标含义和流域治理相关问题。</p>
            </div>
          </div>
        </div>
      `;
    }
    window.chatUtils?.clearHistory();
    loadHistoryList();
  }

  function bindEvents() {
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
      chatForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const messageInput = document.getElementById('messageInput');
        const message = messageInput?.value.trim();
        if (!message) return;
        sendMessage(message);
        messageInput.value = '';
      });
    }

    document.querySelectorAll('.hot-question').forEach((button) => {
      button.addEventListener('click', () => sendMessage(button.textContent.trim()));
    });

    const clearChatBtn = document.getElementById('clearChatBtn');
    if (clearChatBtn) {
      clearChatBtn.addEventListener('click', () => {
        if (confirm('确定要清空聊天记录吗？')) {
          clearChat();
        }
      });
    }
  }

  function initChatPage() {
    const chatForm = document.getElementById('chatForm');
    if (!chatForm || initializedForm === chatForm) return;
    initializedForm = chatForm;

    window.chatUtils?.initParticles();
    const currentUser = window.chatUtils?.getCurrentUser?.() || { username: '访客', role: '未登录' };
    window.layout?.updateUserInfo(currentUser);
    window.layout?.initNavigation();
    bindEvents();
    loadHistoryList();
    window.logout = window.chatUtils?.logout;
  }

  window.HaiheChatPage = { init: initChatPage };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatPage);
  } else {
    initChatPage();
  }
}());
