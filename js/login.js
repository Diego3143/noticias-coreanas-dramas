// Lógica de Autenticación para Noticias de Corea
import { auth, db, storage } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
    ref as sRef, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

document.addEventListener('DOMContentLoaded', () => {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const groupName = document.getElementById('group-name');
    const groupAvatar = document.getElementById('group-avatar');
    const regNameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const avatarInput = document.getElementById('reg-avatar');
    const btnSelectAvatar = document.getElementById('btn-select-avatar');
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarFilename = document.getElementById('avatar-filename');
    const btnSubmit = document.getElementById('btn-submit');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const alertDiv = document.getElementById('auth-alert');
    const authForm = document.getElementById('auth-form');
    const footerText = document.getElementById('auth-footer-text');

    let mode = 'login'; // 'login' o 'register'
    let selectedAvatarFile = null;

    // Alternar pestañas / modo
    const setMode = (newMode) => {
        mode = newMode;
        showAlert('', 'clear');

        if (mode === 'login') {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            groupName.classList.add('hidden');
            groupAvatar.classList.add('hidden');
            regNameInput.removeAttribute('required');
            btnText.textContent = 'Ingresar';
            footerText.innerHTML = '¿No tienes cuenta? <a href="#" id="link-switch-state">Regístrate gratis</a>';
        } else {
            tabLogin.classList.remove('active');
            tabRegister.classList.add('active');
            groupName.classList.remove('hidden');
            groupAvatar.classList.remove('hidden');
            regNameInput.setAttribute('required', 'required');
            btnText.textContent = 'Registrarse';
            footerText.innerHTML = '¿Ya tienes cuenta? <a href="#" id="link-switch-state">Inicia sesión aquí</a>';
        }
    };

    tabLogin.addEventListener('click', () => setMode('login'));
    tabRegister.addEventListener('click', () => setMode('register'));

    // Delegación de eventos en el footer (contenedor estable, no se reemplaza);
    // así evitamos re-enlazar listeners cada vez que cambiamos de modo.
    const authFooterContainer = document.querySelector('.auth-footer');
    authFooterContainer.addEventListener('click', (e) => {
        const link = e.target.closest('#link-switch-state');
        if (!link) return;
        e.preventDefault();
        setMode(mode === 'login' ? 'register' : 'login');
    });

    // Control del Selector de Avatar
    btnSelectAvatar.addEventListener('click', () => {
        avatarInput.click();
    });

    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedAvatarFile = file;
            avatarFilename.textContent = file.name;

            // Mostrar vista previa local
            const reader = new FileReader();
            reader.onload = (event) => {
                avatarPreview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Mostrar Alertas
    const showAlert = (message, type = 'error') => {
        alertDiv.className = 'auth-alert';
        if (type === 'clear') {
            alertDiv.classList.add('hidden');
            return;
        }
        alertDiv.classList.add(type);
        alertDiv.textContent = message;
    };

    // Compresión de imagen alternativa (si Firebase Storage falla)
    const compressImageToBase64 = (file, maxWidth = 120, maxHeight = 120) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    // Subir Foto de Perfil (Con fallback resiliente)
    const processAvatarUpload = async (user, file) => {
        try {
            // Intentar subir a Firebase Storage
            const storagePath = `avatars/${user.uid}`;
            const fileRef = sRef(storage, storagePath);
            await uploadBytes(fileRef, file);
            const downloadUrl = await getDownloadURL(fileRef);
            return downloadUrl;
        } catch (storageError) {
            console.warn("Firebase Storage falló (posiblemente por reglas de seguridad). Usando fallback de base64 en Base de datos...", storageError);
            
            // Comprimir imagen y generar base64
            try {
                const base64Data = await compressImageToBase64(file);
                // Guardar en la base de datos en tiempo real
                await set(ref(db, `users/${user.uid}/photoURL`), base64Data);
                return base64Data;
            } catch (compressError) {
                console.error("Fallo también el fallback de compresión:", compressError);
                return "https://api.dicebear.com/7.x/bottts/svg?seed=" + user.uid;
            }
        }
    };

    // Manejar envío del formulario
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showAlert('', 'clear');

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const displayName = regNameInput.value.trim();

        if (!email || !password) {
            showAlert('Por favor, completa los campos obligatorios.');
            return;
        }

        if (password.length < 6) {
            showAlert('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (mode === 'register' && !displayName) {
            showAlert('Por favor, ingresa tu nombre completo.');
            return;
        }

        // Mostrar estado de carga
        btnSubmit.disabled = true;
        btnText.classList.add('hidden');
        btnSpinner.classList.remove('hidden');

        try {
            if (mode === 'login') {
                // Iniciar sesión
                await signInWithEmailAndPassword(auth, email, password);
                showAlert('¡Acceso correcto! Redirigiendo...', 'success');
                setTimeout(() => {
                    // Redirigir al inicio o a la página anterior
                    const referrer = document.referrer;
                    if (referrer && referrer.includes(window.location.hostname) && !referrer.includes('login.html')) {
                        window.location.href = referrer;
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1500);

            } else {
                // Registrarse
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                let finalPhotoURL = "https://api.dicebear.com/7.x/bottts/svg?seed=" + user.uid;

                if (selectedAvatarFile) {
                    finalPhotoURL = await processAvatarUpload(user, selectedAvatarFile);
                }

                // Guardar información extendida del usuario en Realtime Database
                await set(ref(db, `users/${user.uid}`), {
                    displayName: displayName,
                    email: email,
                    photoURL: finalPhotoURL,
                    updatedAt: Date.now()
                });

                // Actualizar perfil de Firebase Auth
                // Nota: Si finalPhotoURL es un base64 largo, Firebase Auth podría rechazarlo si supera los 2048 caracteres.
                // Si es un base64, pasamos un avatar por defecto a Auth, pero guardamos el real en la base de datos.
                const authPhotoURL = finalPhotoURL.startsWith('data:') ? `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}` : finalPhotoURL;
                await updateProfile(user, {
                    displayName: displayName,
                    photoURL: authPhotoURL
                });

                showAlert('¡Registro exitoso! Iniciando sesión...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        } catch (error) {
            console.error("Error de Firebase Auth:", error);
            let userMessage = 'Ocurrió un error al procesar tu solicitud.';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    userMessage = 'Este correo electrónico ya está registrado.';
                    break;
                case 'auth/invalid-email':
                    userMessage = 'El formato del correo electrónico no es válido.';
                    break;
                case 'auth/weak-password':
                    userMessage = 'La contraseña es demasiado débil.';
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    userMessage = 'Correo o contraseña incorrectos. Verifica tus datos.';
                    break;
            }

            showAlert(userMessage, 'error');
            btnSubmit.disabled = false;
            btnText.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
        }
    });
});
