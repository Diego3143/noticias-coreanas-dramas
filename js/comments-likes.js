// Sistema de Likes y Comentarios en tiempo real para Noticias de Corea
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    ref, 
    set, 
    push, 
    onValue, 
    get 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";


document.addEventListener('DOMContentLoaded', () => {
    // Obtener ID único de la página actual
    const pageId = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

    // Evitar ejecutar en el index.html
    if (pageId === 'index' || window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/html/')) {
        console.log("Página Index detectada. Omitiendo sección de comentarios y likes.");
        return;
    }

    console.log(`Inicializando likes y comentarios para la página: ${pageId}`);

    // Cargar estilos dinámicamente para no ensuciar el HTML
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/comments-likes.css';
    document.head.appendChild(link);

    // Inyectar elementos HTML
    injectHtmlElements();

    // Referencias a elementos del DOM inyectados
    const likeBtn = document.getElementById('btn-like');
    const likeCountSpan = document.getElementById('like-count');
    const commentCountBarSpan = document.getElementById('comment-count-bar');
    const barCommentBtn = document.getElementById('btn-bar-comment');
    
    const commentBubble = document.getElementById('floating-bubble');
    const commentBadge = document.getElementById('bubble-badge');
    
    const modal = document.getElementById('comments-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalCommentCount = document.getElementById('modal-comment-count');
    
    const commentsList = document.getElementById('comments-list');
    const replyIndicator = document.getElementById('reply-indicator');
    const replyIndicatorText = document.getElementById('reply-indicator-text');
    const btnCancelReply = document.getElementById('btn-cancel-reply');
    
    const commentForm = document.getElementById('comment-form');
    const textarea = document.getElementById('comment-textarea');
    const btnSend = document.getElementById('btn-send-comment');
    
    const loginPrompt = document.getElementById('login-prompt');
    const replyIndicatorName = document.getElementById('reply-indicator-name');

    // Variables de Estado
    let currentUser = null;
    let usersCache = {}; // Cache en tiempo real de perfiles de usuario
    let repliesMap = {}; // Mapeo de comentarios
    let parentCommentId = null; // ID de comentario al que se está respondiendo

    // --- 1. INYECCIÓN DINÁMICA DE HTML ---
    function injectHtmlElements() {
        // A) Insertar barra de likes y comentarios en el artículo (al final de .detail-content)
        const detailContent = document.querySelector('.detail-content');
        if (detailContent) {
            const barHtml = `
                <div class="likes-comments-bar">
                    <div class="bar-interaction-group">
                        <button class="interaction-btn like-btn" id="btn-like" aria-label="Me gusta">
                            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            <span id="like-count">0</span>
                        </button>
                        <button class="interaction-btn" id="btn-bar-comment" aria-label="Comentarios">
                            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            <span id="comment-count-bar">0 Comentarios</span>
                        </button>
                    </div>
                    <div class="social-share-group">
                        <!-- Compartir social ficticio para estética premium -->
                        <span style="font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.25rem;">
                            Compartir en redes
                        </span>
                    </div>
                </div>
            `;
            detailContent.insertAdjacentHTML('beforeend', barHtml);
        }

        // B) Insertar burbuja de chat flotante en el body
        const bubbleHtml = `
            <button class="floating-comment-bubble" id="floating-bubble" aria-label="Abrir comentarios">
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span class="comment-badge hidden" id="bubble-badge">0</span>
            </button>
        `;
        document.body.insertAdjacentHTML('beforeend', bubbleHtml);

        // C) Insertar modal flotante de comentarios en el body
        const modalHtml = `
            <div class="comments-modal" id="comments-modal">
                <div class="comments-modal-header">
                    <div class="modal-title-group">
                        <h3>Comentarios</h3>
                        <p id="modal-comment-count">Cargando comentarios...</p>
                    </div>
                    <button class="modal-close-btn" id="modal-close" aria-label="Cerrar modal">&times;</button>
                </div>
                
                <div class="comments-modal-body" id="comments-list">
                    <div class="comments-loading">
                        <div class="spinner"></div>
                        <p>Sincronizando con Firebase...</p>
                    </div>
                </div>

                <div class="comments-modal-footer">
                    <!-- Indicador de respuesta activa -->
                    <div class="reply-indicator hidden" id="reply-indicator">
                        <span class="reply-indicator-text">Respondiendo a <strong id="reply-indicator-name">...</strong></span>
                        <button class="cancel-reply-btn" id="btn-cancel-reply">Cancelar</button>
                    </div>

                    <!-- Editor de comentarios -->
                    <form id="comment-form" onsubmit="return false;">
                        <div class="comment-editor-wrapper">
                            <textarea class="editor-textarea" id="comment-textarea" placeholder="Escribe un comentario..." disabled></textarea>
                            <button type="submit" class="send-comment-btn" id="btn-send-comment" disabled aria-label="Enviar">
                                <svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                            </button>
                        </div>
                    </form>

                    <!-- Mensaje si no ha iniciado sesión -->
                    <div class="modal-login-prompt" id="login-prompt">
                        <p>Debes <a href="login.html">iniciar sesión</a> para comentar o dar like.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // --- 2. CONTROL DEL MODAL ---
    const toggleModal = () => {
        modal.classList.toggle('active');
        if (modal.classList.contains('active')) {
            textarea.focus();
            // Desplazar al final de la lista al abrir
            setTimeout(() => {
                commentsList.scrollTop = commentsList.scrollHeight;
            }, 300);
        }
    };

    commentBubble.addEventListener('click', toggleModal);
    modalCloseBtn.addEventListener('click', toggleModal);
    if (barCommentBtn) {
        barCommentBtn.addEventListener('click', toggleModal);
    }

    // --- 3. AUTENTICACIÓN Y ESTADO DE USUARIO ---
    // Escuchar el estado de la autenticación
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        
        if (user) {
            // Usuario logueado
            loginPrompt.classList.add('hidden');
            textarea.disabled = false;
            btnSend.disabled = false;
            textarea.placeholder = "Escribe un comentario...";

            // Refrescar estado del botón de Like
            checkUserLikeState();

        } else {
            // Usuario deslogueado
            loginPrompt.classList.remove('hidden');
            textarea.disabled = true;
            btnSend.disabled = true;
            textarea.placeholder = "Inicia sesión para comentar...";
            likeBtn.classList.remove('active');
        }
    });

    // Cache del último snapshot de comentarios (para re-renderizar cuando users cambia)
    let lastRawComments = null;

    // Escuchar cambios globales en los perfiles de usuario
    // (solo actualiza cache y re-renderiza; NO registra listeners de comentarios aquí)
    onValue(ref(db, 'users'), (snapshot) => {
        if (snapshot.exists()) {
            usersCache = snapshot.val();
        } else {
            usersCache = {};
        }
        // Si ya hay comentarios cargados, re-renderizar con datos frescos de usuarios
        if (lastRawComments !== null) {
            renderCommentsFromData(lastRawComments);
        }
    });

    // --- 4. INTERACCIONES DE ME GUSTA (LIKES) ---
    // Verificar si el usuario ha dado like a esta página
    async function checkUserLikeState() {
        if (!currentUser) return;
        const userLikeRef = ref(db, `likes/${pageId}/users/${currentUser.uid}`);
        const snapshot = await get(userLikeRef);
        if (snapshot.exists()) {
            likeBtn.classList.add('active');
        } else {
            likeBtn.classList.remove('active');
        }
    }

    // Escuchar el contador total de likes en tiempo real
    onValue(ref(db, `likes/${pageId}`), (snapshot) => {
        const data = snapshot.val();
        const count = data?.count || 0;
        likeCountSpan.textContent = count;
        
        // Comprobar si el usuario actual le dio like
        if (currentUser && data?.users && data.users[currentUser.uid]) {
            likeBtn.classList.add('active');
        } else {
            likeBtn.classList.remove('active');
        }
    });

    // Evento de click en Likes
    likeBtn.addEventListener('click', async () => {
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        likeBtn.disabled = true;

        const userLikeRef = ref(db, `likes/${pageId}/users/${currentUser.uid}`);
        const likeCountRef = ref(db, `likes/${pageId}/count`);

        try {
            const snapshot = await get(userLikeRef);
            const countSnap = await get(likeCountRef);
            let currentCount = countSnap.val() || 0;

            if (snapshot.exists()) {
                // Quitar Like
                await set(userLikeRef, null);
                await set(likeCountRef, Math.max(0, currentCount - 1));
                likeBtn.classList.remove('active');
            } else {
                // Dar Like
                await set(userLikeRef, true);
                await set(likeCountRef, currentCount + 1);
                likeBtn.classList.add('active');
            }
        } catch (err) {
            console.error("Error al procesar el like:", err);
        } finally {
            likeBtn.disabled = false;
        }
    });

    // --- 6. GESTIÓN DE COMENTARIOS ---

    // Cargar y estructurar comentarios en tiempo real
    // Registra el listener UNA sola vez (no anidado con el de users)
    function loadCommentsRealtime() {
        onValue(ref(db, `comments/${pageId}`), (snapshot) => {
            if (!snapshot.exists()) {
                lastRawComments = null;
                commentsList.innerHTML = `
                    <div class="no-comments-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <p>No hay comentarios aún.</p>
                        <span style="font-size: 0.8rem; color: var(--text-secondary);">¡Sé el primero en dejar tu opinión!</span>
                    </div>
                `;
                commentCountBarSpan.textContent = '0 Comentarios';
                modalCommentCount.textContent = '0 comentarios';
                commentBadge.classList.add('hidden');
                commentBadge.textContent = '0';
                return;
            }

            const rawComments = snapshot.val();
            lastRawComments = rawComments;
            renderCommentsFromData(rawComments);
        }, (error) => {
            console.error("Error al cargar comentarios de Firebase:", error);
            commentsList.innerHTML = `<p style="color: #f87171; text-align: center;">Error al cargar comentarios.</p>`;
        });
    }

    // Renderiza el árbol de comentarios a partir de los datos crudos
    function renderCommentsFromData(rawComments) {
            const commentItems = [];
            let totalCommentsCount = 0;

            // Formatear comentarios en un array plano
            for (let id in rawComments) {
                commentItems.push({
                    id: id,
                    ...rawComments[id]
                });
                totalCommentsCount++;
            }

            // Actualizar contadores
            commentCountBarSpan.textContent = `${totalCommentsCount} Comentario${totalCommentsCount !== 1 ? 's' : ''}`;
            modalCommentCount.textContent = `${totalCommentsCount} comentario${totalCommentsCount !== 1 ? 's' : ''}`;
            
            commentBadge.textContent = totalCommentsCount;
            if (totalCommentsCount > 0) {
                commentBadge.classList.remove('hidden');
            } else {
                commentBadge.classList.add('hidden');
            }

            // Crear el árbol de comentarios (Parent - Child Threading)
            const commentsMap = {};
            const rootComments = [];

            // Inicializar mapeos
            commentItems.forEach(comment => {
                comment.replies = [];
                commentsMap[comment.id] = comment;
            });

            // Enlazar hijos con padres
            commentItems.forEach(comment => {
                if (comment.parentId && commentsMap[comment.parentId]) {
                    commentsMap[comment.parentId].replies.push(comment);
                } else {
                    rootComments.push(comment);
                }
            });

            // Ordenar por marca de tiempo (los más antiguos primero)
            const sortFn = (a, b) => a.timestamp - b.timestamp;
            rootComments.sort(sortFn);
            
            commentItems.forEach(c => {
                if (c.replies.length > 0) {
                    c.replies.sort(sortFn);
                }
            });

            // Renderizar el árbol HTML
            renderCommentTree(rootComments);
    }

    // Renderizar árbol de comentarios
    function renderCommentTree(rootComments) {
        let treeHtml = rootComments.map(comment => renderCommentNode(comment)).join('');
        commentsList.innerHTML = treeHtml;

        // Agregar listeners para el botón de responder
        const replyButtons = commentsList.querySelectorAll('.reply-btn');
        replyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const commentId = btn.getAttribute('data-comment-id');
                const authorName = btn.getAttribute('data-author-name');
                setReplyMode(commentId, authorName);
            });
        });
    }

    // Renderizar recursivamente un nodo de comentario y sus respuestas
    function renderCommentNode(comment) {
        const timestamp = comment.timestamp;
        const dateStr = new Date(timestamp).toLocaleString('es-ES', { 
            dateStyle: 'short', 
            timeStyle: 'short' 
        });

        // Obtener datos del cache en tiempo real si existen, sino usar los guardados en el comentario
        const userProfile = usersCache[comment.authorUid];
        const authorName = userProfile?.displayName || comment.authorName || 'Usuario';
        const authorPhoto = userProfile?.photoURL || comment.authorPhoto || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + comment.authorUid;

        // Escapar nombre para prevenir XSS (al printable y como atributo)
        const safeAuthorName = escapeHtml(authorName);
        const authorNameAttr = safeAuthorName;

        let repliesHtml = '';
        if (comment.replies && comment.replies.length > 0) {
            repliesHtml = `
                <div class="comment-replies">
                    ${comment.replies.map(child => renderCommentNode(child)).join('')}
                </div>
            `;
        }

        return `
            <div class="comment-item" id="comment-${comment.id}">
                <div class="comment-main">
                    <div class="comment-avatar-wrapper">
                        <img src="${authorPhoto}" class="comment-avatar" alt="Avatar de ${safeAuthorName}" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=${comment.authorUid}'">
                    </div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">${safeAuthorName}</span>
                            <span class="comment-date">${dateStr}</span>
                        </div>
                        <p class="comment-text">${escapeHtml(comment.content)}</p>
                        <div class="comment-actions">
                            <button class="comment-action-btn reply-btn" data-comment-id="${comment.id}" data-author-name="${authorNameAttr}">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                Responder
                            </button>
                        </div>
                    </div>
                </div>
                ${repliesHtml}
            </div>
        `;
    }

    // Configurar modo respuesta
    function setReplyMode(commentId, authorName) {
        parentCommentId = commentId;
        replyIndicatorName.textContent = authorName;
        replyIndicator.classList.remove('hidden');
        textarea.focus();
        // Desplazar editor hacia la vista si es necesario
        textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Cancelar modo respuesta
    btnCancelReply.addEventListener('click', () => {
        parentCommentId = null;
        replyIndicator.classList.add('hidden');
    });

    // Enviar comentario / respuesta
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        const text = textarea.value.trim();
        if (!text) return;

        // Deshabilitar envío durante proceso
        textarea.disabled = true;
        btnSend.disabled = true;

        try {
            // Obtener el perfil actualizado
            const userSnap = await get(ref(db, `users/${currentUser.uid}`));
            const userData = userSnap.val();
            const displayName = userData?.displayName || currentUser.displayName || 'Usuario';
            const photoURL = userData?.photoURL || currentUser.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + currentUser.uid;

            // Nuevo comentario
            const commentsRef = ref(db, `comments/${pageId}`);
            const newCommentRef = push(commentsRef);

            const commentPayload = {
                authorUid: currentUser.uid,
                authorName: displayName,
                authorPhoto: photoURL,
                content: text,
                timestamp: Date.now()
            };

            if (parentCommentId) {
                commentPayload.parentId = parentCommentId;
            }

            await set(newCommentRef, commentPayload);

            // Limpiar formulario y reiniciar respuesta
            textarea.value = '';
            parentCommentId = null;
            replyIndicator.classList.add('hidden');
            
            // Hacer scroll hasta el fondo
            setTimeout(() => {
                commentsList.scrollTop = commentsList.scrollHeight;
            }, 100);

        } catch (err) {
            console.error("Error al publicar comentario:", err);
            alert("No se pudo enviar el comentario. Inténtalo de nuevo.");
        } finally {
            textarea.disabled = false;
            btnSend.disabled = false;
            textarea.focus();
        }
    });

    // Utilidad: Escapar caracteres HTML para seguridad (XSS prevention)
    function escapeHtml(text) {
        if (typeof text !== 'string') {
            text = String(text != null ? text : '');
        }
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Inicializar carga de comentarios
    loadCommentsRealtime();
});
