import { router, state } from './router.js';  // ← добавлен state

export let isAdminLoggedIn = false;

export async function checkAuth() {
    try {
        const res = await fetch('/api/check-auth');
        const data = await res.json();
        isAdminLoggedIn = data.logged_in;
    } catch (e) { }
}

export function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.error('Модалка не найдена в DOM');
    }
}

export function closeModal() {
    const modal = document.getElementById('login-modal');
    const input = document.getElementById('admin-password');
    if (modal) modal.style.display = 'none';
    if (input) input.value = '';
}

export async function adminLogin() {
    const password = document.getElementById('admin-password').value;
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    if (res.ok) {
        isAdminLoggedIn = true;
        closeModal();
        router('admin');   // ← ВОТ ГЛАВНОЕ ИЗМЕНЕНИЕ
    } else {
        alert('Неверный пароль');
    }
}

export async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    isAdminLoggedIn = false;
    if (state.currentView?.startsWith('admin')) {   // ← исправлено условие
        router('home');
    }
}

window.closeModal = closeModal;
window.adminLogin = adminLogin;