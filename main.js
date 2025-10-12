// Esperamos a que el DOM esté cargado porque sino explota todo :p
document.addEventListener('DOMContentLoaded', function() {
    
    /////titulo del NAVEGADOR
    const headerTitle = document.getElementById('header-title');
    ///Animacion tipo maquina de escribir para el título del header
    
    function typewriterEffect() {
        const text = 'TaskManager Pro';
        const blueText = 'Pro';
        headerTitle.innerHTML = ''; // Limpiar el contenido
        
        let index = 0;
        
        function typeCharacter() {
            if (index < text.length) {
                // Si estamos en la palabra "Pro", aplicar color azul
                if (index >= text.length - blueText.length) {
                    const beforePro = text.substring(0, text.length - blueText.length);
                    const currentPro = text.substring(text.length - blueText.length, index + 1);
                    headerTitle.innerHTML = beforePro + '<span class="text-[#FFB347]">' + currentPro + '</span>';
                } else {
                    headerTitle.innerHTML = text.substring(0, index + 1);
                }
                
                index++;
                setTimeout(typeCharacter, 100); // Velocidad de escritura (100ms por caracter)
            }
        }
        
        typeCharacter();
    }
    
    // Iniciar el efecto de máquina de escribir
    typewriterEffect();


    // Animación inicial del hero
    const heroTimeline = anime.timeline({
        easing: 'easeOutExpo',
        duration: 1000
    });

    heroTimeline
        .add({
            targets: '#hero-title',
            opacity: [0, 1],
            translateY: [50, 0],
            delay: 500
        })
        .add({
            targets: '#hero-subtitle',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: 200
        }, '-=500');

    // Animación de las tarjetas que tengan "card" en la clase
    anime({
        targets: '.card',
        opacity: [0, 1],
        translateY: [40, 0],
        delay: anime.stagger(200, {start: 1500}),
        duration: 800,
        easing: 'easeOutCubic'
    });
    ////rotacion a los iconos de las tarjetas cuando paso el mouse por encima
    const icons = document.querySelectorAll('.icon');
    icons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            anime({
                targets: icon,
                rotate: [0, 25],///angulo de rotacion
                duration: 100,//velocidad de la animacion (menos timepo mas fluiedez)
                easing: 'easeOutExpo'
            });
        });

        icon.addEventListener('mouseleave', () => {
            anime({
                targets: icon,
                rotate: [25, 0],
                duration: 100,
                easing: 'easeOutExpo'
            });
        });
    });

    // Animación de la sección de tareas , aparicion con movimiento de costados hacia adentro
    ///para las tarjetas del final
    anime({
        targets: '.cards',
        opacity: [0, 1],
        translateY: [60, 0],
        translateX: [-30, 0],
        scale: [0.8, 1],
        rotate: [5, 0],
        delay: anime.stagger(150, {start: 1200}),
        duration: 1000,
        easing: 'easeOutElastic(1, .8)'
    });

    // Las animaciones de hover ahora están en CSS para mejor performance

    // Animación de texto flotante
    function floatingText() {
        anime({
            targets: '#hero-title',
            translateY: [0, -10, 0],
            duration: 3000,
            easing: 'easeInOutSine',
            loop: true
        });
    }

    // Iniciar animación flotante después de 3 segundos
    setTimeout(floatingText, 3000);



    ///animacion para tarjeta de login 
    const loginCard = document.getElementById('loginCard');

    anime({
        targets: [loginCard, taskSection],
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 800,
        easing: 'easeOutExpo'
    });

    ////Animacion hover para el boton de micrófono
    const micButton = document.getElementById('micButton');
        anime({
        targets: [micButton],
        scale: [1, 1.1],
        duration: 800,
        direction: 'alternate',
        easing: 'easeInOutSine',
        loop: true
    });

   

});
////////////////////////////////////////////////////##############################################/
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
////////////DIFERENCIAS ENTRE VAR, LET Y CONST
// var: tiene alcance de función y puede ser redeclarada y reasignada
// let: tiene alcance de bloque y no puede ser redeclarada en el mismo bloque
// const: tiene alcance de bloque, no puede ser redeclarada y su valor no puede ser reasignado

document.getElementById('varExample').style.color = '#FFB347'; // Naranja
document.getElementById('letExample').style.color = '#FFB347'; // Naranja
document.getElementById('constExample').style.color = '#FFB347'; // Naranja

var ejemploVar = "Soy una variable var";
let ejemploLet = "Soy una variable let";
const ejemploConst = "Soy una constante const";




////////////////////////////////////////////////////##############################################/
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################

////LISTA DE TAREAS
    // Agregar tareas a la lista
const tareas = []; // Array principal para el usuario actual

const tareaInput = document.getElementById("tareaInput");
const agregarBtn = document.getElementById("agregarBtn");
const listaTareas = document.getElementById("listaTareas");


// Variable global para manejar el estado de login
let isLoggedIn = false;
let currentUser = null; // Usuario actualmente logueado

////funcion para manejar estados de sesión (imagen vs lista de tareas)
function toggleTaskStates() {
    const noSessionState = document.getElementById("noSessionState");
    const sessionActiveState = document.getElementById("sessionActiveState");
    
    if (noSessionState && sessionActiveState) {
        if (isLoggedIn) {
            // Mostrar lista de tareas y ocultar imagen
            noSessionState.classList.add("hidden");
            sessionActiveState.classList.remove("hidden");
            console.log("Estado activo: Lista de tareas mostrada - Usuario logueado");
        } else {
            // Mostrar imagen y ocultar lista de tareas
            noSessionState.classList.remove("hidden");
            sessionActiveState.classList.add("hidden");
            console.log("Estado activo: Imagen mostrada - Usuario no logueado");
        }
    } else {
        console.warn("Elementos de estado no encontrados");
    }
}



// Función para cerrar sesión
function logout() {
    isLoggedIn = false;
    currentUser = null; // Limpiar usuario actual
    
    // Limpiar tareas de la vista actual
    tareas.splice(0); // Vaciar array de tareas
    
    // Actualizar interfaz
    toggleTaskStates();
    
    // Limpiar formulario
    const loginForm = document.querySelector('form');
    if (loginForm) {
        loginForm.reset();
        
        // Limpiar mensajes
        const mensajeDiv = document.getElementById('loginMessage');
        if (mensajeDiv) {
            mensajeDiv.textContent = '';
        }
        
        // Ocultar botón de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
    }
    
    // Limpiar nombre del usuario mostrado
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = '';
    }
    
     
}


// Función para agregar tarea
function agregarTarea() {
    const tareaInput = document.getElementById("tareaInput");
    
    
    const texto = tareaInput.value.trim();
    if (texto) {
        // Crear objeto tarea con texto y estado de completado
        const nuevaTarea = {
            texto: texto,
            completada: false
        };
        tareas.push(nuevaTarea);
        tareaInput.value = "";
        mostrarTareas();
        guardarTareas();
        console.log(`Tarea agregada: "${texto}"`);
    }
}

// Función para marcar todas las tareas como completadas
function marcarTodasCompletadas() {
    tareas.forEach(tarea => tarea.completada = true);
    mostrarTareas();
    guardarTareas();
}

// Función para desmarcar todas las tareas
function desmarcarTodas() {
    tareas.forEach(tarea => tarea.completada = false);
    mostrarTareas();
    guardarTareas();
}

// Función para eliminar tareas completadas
function eliminarCompletadas() {
    const tareasAntesCount = tareas.length;
    tareas.splice(0, tareas.length, ...tareas.filter(tarea => !tarea.completada));
    const tareasEliminadas = tareasAntesCount - tareas.length;
    
    if (tareasEliminadas > 0) {
        console.log(`${tareasEliminadas} tarea(s) completada(s) eliminada(s)`);
        mostrarTareas();
        guardarTareas();
    }
}

// Función para configurar event listeners de las tareas
function configurarEventListenersTareas() {
    const tareaInput = document.getElementById("tareaInput");
    const agregarBtn = document.getElementById("agregarBtn");
    
    console.log("Configurando event listeners...");
    console.log("tareaInput encontrado:", !!tareaInput);
    console.log("agregarBtn encontrado:", !!agregarBtn);
    
    if (tareaInput && agregarBtn) {
        // Limpiar listeners anteriores si existen
        agregarBtn.replaceWith(agregarBtn.cloneNode(true));
        const nuevoAgregarBtn = document.getElementById("agregarBtn");
        
        // Event listener para el botón
        nuevoAgregarBtn.addEventListener("click", agregarTarea);

        // Event listener para Enter en el input
        tareaInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                agregarTarea();
            }
        });
        
        console.log("Event listeners de tareas configurados exitosamente");
    } else {
        console.warn("No se pudieron encontrar los elementos de tareas");
    }
}


////Funcion mostrar tareas 
function mostrarTareas() {
    const listaTareas = document.getElementById("listaTareas");
    const contadorTareas = document.getElementById("contadorTareas");
    
    if (!listaTareas) {
        console.warn("Elemento listaTareas no encontrado");
        return;
    }
    
    listaTareas.innerHTML = "";
    tareas.forEach(function(tarea, index) {
        const li = document.createElement("li");
        li.className = `flex justify-between items-center p-3 rounded-lg shadow-sm cursor-move transition-all duration-200 hover:shadow-md ${
            tarea.completada 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-white border border-gray-200'
        }`;
        
        // ATRIBUTOS PARA DRAG & DROP
        li.draggable = true;
        li.dataset.index = index;
        
        // ICONO DE DRAG
        const dragIcon = document.createElement("span");
        dragIcon.innerHTML = "⋮⋮";
        dragIcon.className = "text-gray-400 text-lg mr-3 cursor-move";
        
        // CHECKBOX PARA MARCAR COMO COMPLETADA
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = tarea.completada;
        checkbox.className = "w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 mr-3";
        checkbox.onchange = function() {
            tarea.completada = this.checked;
            mostrarTareas();
            guardarTareas();
        };
        
        const tareaTexto = document.createElement("span");
        tareaTexto.textContent = tarea.texto;
        tareaTexto.className = `flex-1 ${
            tarea.completada 
                ? 'text-gray-500 line-through' 
                : 'text-gray-800'
        }`;
        
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.className = "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors";
        btnEliminar.onclick = function(){
            tareas.splice(index, 1);
            mostrarTareas();
            guardarTareas();
        };
        
        // ESTRUCTURA: [icono] [checkbox] [texto] [botón]
        li.appendChild(dragIcon);
        li.appendChild(checkbox);
        li.appendChild(tareaTexto);
        li.appendChild(btnEliminar);
        listaTareas.appendChild(li);
    });
    
    // Actualizar contador con tareas completadas y pendientes
    const tareasCompletadas = tareas.filter(tarea => tarea.completada).length;
    const tareasPendientes = tareas.length - tareasCompletadas;
    
    if (contadorTareas) {
        contadorTareas.textContent = 
            `Total: ${tareas.length} | Pendientes: ${tareasPendientes} | Completadas: ${tareasCompletadas}`;
    }

    agregarEventosDragAndDrop();
}



// Agregar tareas al LocalStorage para cada usuario por separado
function guardarTareas() {
    if (currentUser) {
        const userKey = `tareas_${currentUser.username}`;
        localStorage.setItem(userKey, JSON.stringify(tareas));
        console.log(`Tareas guardadas para usuario: ${currentUser.username}`);
    }
}

// Cargar tareas del LocalStorage específicas del usuario
function cargarTareasUsuario() {
    if (currentUser) {
        const userKey = `tareas_${currentUser.username}`;
        const tareasGuardadas = localStorage.getItem(userKey);
        
        // borrar tareas actuales
        tareas.splice(0);

        
        if (tareasGuardadas) {
            const tareasParseadas = JSON.parse(tareasGuardadas);
            
            // Migración automática: si las tareas están en formato antiguo (string), convertir al nuevo formato
            tareasParseadas.forEach(tarea => {
                if (typeof tarea === 'string') {
                    // Formato antiguo: convertir string a objeto
                    tareas.push({
                        texto: tarea,
                        completada: false
                    });
                } else {
                    // Formato nuevo: ya es un objeto
                    tareas.push(tarea);
                }
            });
            
            console.log(`Tareas cargadas para usuario ${currentUser.username}:`, tareas);
        } else {
            console.log(`No hay tareas guardadas para usuario: ${currentUser.username}`);
        }
        
        // Mostrar las tareas del usuario
        mostrarTareas();
    }
}

// Comentar el código de carga automática de tareas ya que ahora se carga por usuario
// La carga se realizará cuando el usuario haga login exitoso

////DRAG Y DROP PARA REORDENAR TAREAS
let arrastrandoElemento = null;
let indiceArrastrando = null;

///Agregar event listenes a la lista
function agregarEventosDragAndDrop() {
    const items = listaTareas.querySelectorAll('li[draggable="true"]');

    items.forEach(item => {

        ///EVENTO : cuando emepzamos a arrastrar
        item.addEventListener('dragstart', function(e) {
            arrastrandoElemento = this;
            indiceArrastrando = parseInt(this.dataset.index);

            console.log(`Arrastrando tarea ${indiceArrastrando}: "${tareas[indiceArrastrando].texto}"`);

            ////Estilo visual al arrastrar
            this.style.opacity = '0.5';
            this.style.transform = 'rotate(5deg)';

            ///Guardar datos en el Evento
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html',this.outerHTML);

        });


        //// EVENTO: cuando dejamos de arrastrar
        item.addEventListener('dragend', function(e){
            console.log('Arrastre finalizado');

            //restaurar estilos
            this.style.opacity = '1';
            this.style.transform = 'rotate(0deg)';

            arrastrandoElemento = null;
            indiceArrastrando = null;


        });

        //// EVENTO: cuando un elemento arrastrable entra en el area de otro
        item.addEventListener('dragover', function(e) {

            e.preventDefault(); // Necesario para permitir el drop

            //Estilo visual Hover
            this.style.borderTop = '3px solid #3b82f6'; // azul
            this.style.marginTop = '1px';
        });

        //// EVENTO: cuando un elemento arrastrable sale del area de otro
        item.addEventListener('dragleave', function(e) {
            //restaurar estilos
            this.style.borderTop = '';
            this.style.marginTop = '0';
        });

        //// EVENTO: cuando soltamos el elemento arrastrado
        item.addEventListener('drop', function(e) {
            e.preventDefault();

            if (arrastrandoElemento && arrastrandoElemento !== this) {

                const targetIndex = parseInt(this.dataset.index);
                console.log(`Soltando tarea ${indiceArrastrando} sobre tarea ${targetIndex}`);

                ///reordenar el array
                reordenarTareas(indiceArrastrando, targetIndex);
            }

            ///limpiar estilos
            this.style.borderTop = '';
            this.style.marginTop = '0';
        });
    });
}



function reordenarTareas(fromIndex, toIndex) {
    // Guardar la tarea que estamos moviendo
    const tareaMovida = tareas[fromIndex];
    
    // Remover la tarea de su posición original
    tareas.splice(fromIndex, 1);
    
    // Insertar en la nueva posición
    tareas.splice(toIndex, 0, tareaMovida);
    
    console.log('Array reordenado:', tareas);
    
    // Actualizar la interfaz y guardar
    mostrarTareas();
    guardarTareas();
}
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
////USUARIOS DEL SISTEMA
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
const usuarios = [
    {username: 'franco', password: 'fran'},
    {username: 'horacio', password: 'profe'},
    {username: 'test', password: 'test'}
];

// Función para mostrar usuarios disponibles en consola
function mostrarUsuariosDisponibles() {
    console.log("=== USUARIOS DISPONIBLES ===");
    usuarios.forEach(user => {
        console.log(`Usuario: ${user.username} | Contraseña: ${user.password}`);
    });
    console.log("=============================");
}

// Mostrar usuarios al cargar la página
mostrarUsuariosDisponibles();

/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
///////////////////////////////////LOGIN
/////////////////////////////////////////////////////################################################
/////////////////////////////////////////////////////################################################
// Esperar a que el DOM esté cargado para el formulario de login
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar estado inicial (imagen)
    toggleTaskStates();


    ////Evento toggle para el ID eyeIcon (mostrar/ocultar contraseña)
    document.getElementById('eyeIcon').addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const passwordType = passwordInput.getAttribute('type');

        if (passwordType === 'password') {
            passwordInput.setAttribute('type', 'text');
            this.textContent = '👁️';
        } else {
            passwordInput.setAttribute('type', 'password');
            this.textContent = '👁️‍🗨️';
        }
    });

    const loginForm = document.querySelector('form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const usernameInput = document.getElementById('username').value.trim();
            const passwordInput = document.getElementById('password').value.trim();
            
            // Crear div para mensajes si no existe
            let mensajeDiv = document.getElementById('loginMessage');
            if (!mensajeDiv) {
                mensajeDiv = document.createElement('div');
                mensajeDiv.id = 'loginMessage';
                mensajeDiv.className = 'text-center mt-4 font-medium';
                loginForm.appendChild(mensajeDiv);
            }

            // Validar credenciales
            const usuario = usuarios.find(u => u.username === usernameInput && u.password === passwordInput);
            if (usuario) {
                mensajeDiv.textContent = '¡Inicio de sesión exitoso!';
                mensajeDiv.classList.remove('text-red-500');
                mensajeDiv.classList.add('text-[#FFB347]');
                
                // Actualizar estado de login y usuario actual
                isLoggedIn = true;
                currentUser = usuario; // Guardar usuario actual
                toggleTaskStates();
                
                // Cargar tareas específicas del usuario
                cargarTareasUsuario();
                
                // Configurar event listeners para las tareas (con pequeño delay)
                setTimeout(() => {
                    configurarEventListenersTareas();
                }, 100);
                
                // Mostrar nombre del usuario en la lista de tareas
                const usernameDisplay = document.getElementById('usernameDisplay');
                if (usernameDisplay) {
                    usernameDisplay.textContent = usuario.username;
                }
                
                // Crear botón de logout si no existe
                let logoutBtn = document.getElementById('logoutBtn');
                if (!logoutBtn) {
                    logoutBtn = document.createElement('button');
                    logoutBtn.id = 'logoutBtn';
                    logoutBtn.textContent = 'Cerrar Sesión';
                    logoutBtn.className = 'w-full mt-4 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors';
                    logoutBtn.onclick = logout;
                    loginForm.appendChild(logoutBtn);
                }
                logoutBtn.style.display = 'block';
                
                console.log('Usuario autenticado:', usuario.username);
                console.log('Tareas cargadas para el usuario:', tareas.length);
            } else {
                mensajeDiv.textContent = 'Usuario o contraseña incorrectos.';
                mensajeDiv.classList.remove('text-[#FFB347]');
                mensajeDiv.classList.add('text-red-500');
                
                // Asegurar que las tareas permanezcan ocultas
                isLoggedIn = false;
                currentUser = null; // Limpiar usuario actual
                toggleTaskStates();
                
                // Limpiar array de tareas por seguridad
                tareas.splice(0);
                
                // Ocultar botón de logout si existe
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.style.display = 'none';
                }
            }
        });





    }

    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    ///////////////////////////////////////////////////////################################################
    /////////////////////WEB SPEECH API - RECONOCIMIENTO DE VOZ

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-AR'; // Idioma español de Argentina
        recognition.continuous = false;
        recognition.interimResults = false;

        const micButton = document.getElementById('micButton');
        let isListening = false;

        micButton.addEventListener('click', function() {
            if (!isListening) {
                // Cambiar estilo del botón mientras escucha
                micButton.classList.remove('from-blue-500', 'to-blue-600', 'hover:from-blue-600', 'hover:to-blue-700');
                micButton.classList.add('from-red-500', 'to-red-600', 'animate-pulse');
                micButton.title = 'Escuchando... Habla ahora';
                
                recognition.start();
                isListening = true;
                
            }
        });

        //////la API usa un evento en lugar de promesa 
        recognition.addEventListener('result', function(event) {
            const transcript = event.results[0][0].transcript.trim();
            
            
            // Agregar el texto al input
            tareaInput.value = transcript;
            
            // Enfocar el input para que el usuario vea el resultado
            tareaInput.focus();
        });

        recognition.addEventListener('end', function() {
            
            
            // Restaurar estilo original del botón
            micButton.classList.remove('from-red-500', 'to-red-600', 'animate-pulse');
            micButton.classList.add('from-blue-500', 'to-blue-600', 'hover:from-blue-600', 'hover:to-blue-700');
            micButton.title = 'Agregar tarea por voz';
            
            isListening = false;
        });

        recognition.addEventListener('error', function(event) {
            
            
            // Restaurar estilo del botón en caso de error
            micButton.classList.remove('from-red-500', 'to-red-600', 'animate-pulse'); 
            micButton.classList.add('from-blue-500', 'to-blue-600', 'hover:from-blue-600', 'hover:to-blue-700');
            micButton.title = 'Agregar tarea por voz';
            
            isListening = false;
        });

    } else {
        // Mostrar el botón pero deshabilitado si no hay soporte
        const micButton = document.getElementById('micButton');
        if (micButton) {
            micButton.disabled = true;
            micButton.classList.add('opacity-50', 'cursor-not-allowed');
            micButton.title = 'Web Speech API no disponible en este navegador';
            
            micButton.addEventListener('click', function() {
                alert('El navegador no soporta reconocimiento de voz.\n\nPor favor usa Chrome, Edge o Safari para esta funcionalidad.');
            });
        }
        
    }

});

