// Control de Menú Hamburguesa y Autenticación en Index
import { auth, db } from "./firebase-config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    // Inyectar drawer y overlay (el botón hamburguesa y CSS ya están en el HTML)
    injectDrawerHtml();

    // Referencias
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sideDrawer = document.getElementById('side-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerClose = document.getElementById('drawer-close');
    
    const drawerAvatar = document.getElementById('drawer-avatar');
    const drawerUsername = document.getElementById('drawer-username');
    const menuLinkAuth = document.getElementById('menu-link-auth');
    const menuAuthText = document.getElementById('menu-auth-text');
    const menuBtnLogout = document.getElementById('menu-btn-logout');

    // --- 1. ABRIR / CERRAR MENÚ ---
    const openMenu = () => {
        hamburgerBtn.classList.add('active');
        sideDrawer.classList.add('active');
        drawerOverlay.classList.add('active');
    };

    const closeMenu = () => {
        hamburgerBtn.classList.remove('active');
        sideDrawer.classList.remove('active');
        drawerOverlay.classList.remove('active');
    };

    hamburgerBtn.addEventListener('click', () => {
        if (hamburgerBtn.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    drawerClose.addEventListener('click', closeMenu);
    drawerOverlay.addEventListener('click', closeMenu);

    // --- 2. MONITOREAR AUTENTICACIÓN ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuario está conectado
            menuBtnLogout.classList.remove('hidden');
            
            // Vincular base de datos en tiempo real para datos de usuario
            const userDbRef = ref(db, `users/${user.uid}`);
            onValue(userDbRef, (snapshot) => {
                const userData = snapshot.val();
                const displayName = userData?.displayName || user.displayName || 'Usuario K-Drama';
                const photoURL = userData?.photoURL || user.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.uid;

                drawerUsername.textContent = displayName;
                drawerAvatar.src = photoURL;
            });

            // Cambiar enlace de ingresar por ir al perfil o simplemente un saludo
            menuLinkAuth.href = '#';
            menuAuthText.textContent = 'Cuenta Activa';
            menuLinkAuth.style.pointerEvents = 'none'; // Deshabilitar click para no recargar

        } else {
            // Usuario no conectado (Invitado)
            drawerUsername.textContent = 'Invitado';
            drawerAvatar.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';
            menuBtnLogout.classList.add('hidden');

            menuLinkAuth.href = 'login.html';
            menuAuthText.textContent = 'Ingresar / Registrarse';
            menuLinkAuth.style.pointerEvents = 'auto';
        }
    });

    // --- 3. CERRAR SESIÓN ---
    menuBtnLogout.addEventListener('click', async () => {
        try {
            await signOut(auth);
            closeMenu();
            // Recargar o alertar
            alert('Has cerrado sesión correctamente.');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            alert("No se pudo cerrar la sesión.");
        }
    });

    // Auxiliar: Inyectar drawer y overlay (el botón hamburguesa ya está en el HTML)
    function injectDrawerHtml() {
        // Si el drawer ya existe (ej. bfcache), no lo inyectamos de nuevo
        if (document.getElementById('side-drawer')) return;

        const drawerHtml = `
            <!-- Menú Lateral -->
            <div class="side-drawer" id="side-drawer">
                <div class="drawer-header">
                    <button class="drawer-close-btn" id="drawer-close" aria-label="Cerrar Menú">&times;</button>
                </div>
                <div class="drawer-body">
                    <!-- Perfil de usuario -->
                    <div class="drawer-profile" id="drawer-profile">
                        <img src="" class="profile-avatar" id="drawer-avatar" alt="Foto de perfil" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=fallback'">
                        <span class="profile-name" id="drawer-username">Cargando...</span>
                    </div>
                    
                    <!-- Enlaces -->
                    <nav class="drawer-nav">
                        <a href="index.html" class="drawer-link active">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            Inicio
                        </a>
                        <a href="login.html" class="drawer-link" id="menu-link-auth">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
                            <span id="menu-auth-text">Ingresar / Registrarse</span>
                        </a>
                        <button class="drawer-link-btn hidden" id="menu-btn-logout">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                            Cerrar Sesión
                        </button>
                    </nav>
                </div>
            </div>
            
            <!-- Superposición de fondo -->
            <div class="drawer-overlay" id="drawer-overlay"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', drawerHtml);
    }
});
