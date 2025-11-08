// ========================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ========================================
const API_URL = 'http://localhost:3001/api';
const UPDATE_INTERVAL = 10000; // 10 segundos
let chart = null;
let scene, camera, renderer, trashBin, trashFill, mixer;
let currentLevel = 0;

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando GARS Dashboard...');
    createFloatingParticles();
    initChart();
    init3DTrash();
    fetchData();
    setInterval(fetchData, UPDATE_INTERVAL);
});

// ========================================
// CRIAR PARTÍCULAS FLUTUANTES
// ========================================
function createFloatingParticles() {
    const particles = ['♻️', '🌿', '🍃', '🌱'];
    const container = document.body;
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particle.style.fontSize = (20 + Math.random() * 20) + 'px';
        particle.style.opacity = 0.3 + Math.random() * 0.3;
        container.appendChild(particle);
    }
}

// ========================================
// BUSCAR DADOS DO BACKEND
// ========================================
async function fetchData() {
    console.log('🔄 Atualizando dados...');
    
    try {
        const response = await fetch(`${API_URL}/niveis`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            console.log(`✅ ${result.count} registros recebidos`);
            updateDashboard(result.data);
            updateConnectionStatus(true);
        } else {
            console.warn('⚠️ Nenhum dado disponível');
            updateConnectionStatus(false);
        }
        
    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
        updateConnectionStatus(false);
    }
}

// ========================================
// ATUALIZAR DASHBOARD
// ========================================
function updateDashboard(data) {
    // Ordenar por data mais recente
    const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Dados mais recentes
    const latest = sortedData[0];
    const nivel = parseFloat(latest.nivel);
    currentLevel = nivel;
    
    console.log(`📊 Nível atual: ${nivel}`);
    
    // Atualizar indicador de status
    updateStatusIndicator(nivel, latest.created_at);
    
    // Adicionar efeito visual de atualização
    const statusCard = document.getElementById('statusCard');
    statusCard.classList.add('scanning');
    setTimeout(() => statusCard.classList.remove('scanning'), 2000);
    
    // Atualizar gráfico
    updateChart(sortedData.reverse().slice(-20)); // Últimos 20 registros
    
    // Atualizar lixeira 3D
    update3DTrash(nivel);
    
    // Atualizar estatísticas
    updateStats(sortedData);
}

// ========================================
// ATUALIZAR INDICADOR DE STATUS
// ========================================
function updateStatusIndicator(nivel, dataHora) {
    const statusBadge = document.getElementById('statusBadge');
    const nivelValue = document.getElementById('nivelValue');
    const progressFill = document.getElementById('progressFill');
    const lastUpdate = document.getElementById('lastUpdate');
    
    // Determinar status baseado nos valores do banco: 0, 1, 2
    let status, statusText, nivelTexto;
    if (nivel === 0) {
        status = 'normal';
        statusText = 'Normal - Vazia';
        nivelTexto = '0';
    } else if (nivel === 1) {
        status = 'atencao';
        statusText = 'Atenção - Meio Cheia';
        nivelTexto = '1';
    } else if (nivel === 2) {
        status = 'critico';
        statusText = 'Crítico - Cheia';
        nivelTexto = '2';
    } else {
        // Fallback para valores inesperados
        status = 'normal';
        statusText = 'Desconhecido';
        nivelTexto = nivel.toString();
    }
    
    // Atualizar badge
    statusBadge.className = `status-badge ${status}`;
    statusBadge.querySelector('.badge-text').textContent = statusText;
    
    // Atualizar valor
    nivelValue.textContent = nivelTexto;
    nivelValue.className = `nivel-value ${status}`;
    
    // Atualizar barra de progresso (0%, 50%, 100%)
    const percentage = (nivel / 2) * 100;
    progressFill.style.width = `${percentage}%`;
    progressFill.className = `progress-fill ${status}`;
    
    // Atualizar data/hora
    const date = new Date(dataHora);
    lastUpdate.textContent = `Última atualização: ${formatDate(date)}`;
}

// ========================================
// INICIALIZAR GRÁFICO CHART.JS
// ========================================
function initChart() {
    const ctx = document.getElementById('nivelChart').getContext('2d');
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Nível de Resíduos',
                data: [],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#4CAF50',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Poppins',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: 'Poppins',
                        size: 14
                    },
                    bodyFont: {
                        family: 'Poppins',
                        size: 13
                    },
                    padding: 12,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 2,
                    ticks: {
                        stepSize: 1,
                        font: {
                            family: 'Poppins'
                        },
                        callback: function(value) {
                            // Customizar labels do eixo Y
                            if (value === 0) return '0 - Vazia';
                            if (value === 1) return '1 - Meio';
                            if (value === 2) return '2 - Cheia';
                            return value;
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Poppins',
                            size: 10
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// ========================================
// ATUALIZAR GRÁFICO
// ========================================
function updateChart(data) {
    const labels = data.map(item => {
        const date = new Date(item.created_at);
        return formatTime(date);
    });
    
    const valores = data.map(item => parseFloat(item.nivel));
    
    // Atualizar cores baseadas no nível atual (0, 1, 2)
    const latestLevel = valores[valores.length - 1];
    let color = '#4CAF50';
    if (latestLevel === 2) {
        color = '#F44336'; // Vermelho - Cheia
    } else if (latestLevel === 1) {
        color = '#FFC107'; // Amarelo - Meio Cheia
    } else {
        color = '#4CAF50'; // Verde - Vazia
    }
    
    chart.data.labels = labels;
    chart.data.datasets[0].data = valores;
    chart.data.datasets[0].borderColor = color;
    chart.data.datasets[0].backgroundColor = `${color}20`;
    chart.data.datasets[0].pointBackgroundColor = color;
    chart.update('none'); // Animação suave
}

// ========================================
// INICIALIZAR LIXEIRA 3D (THREE.JS)
// ========================================
function init3DTrash() {
    const container = document.getElementById('trashContainer');
    
    // Criar cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    // Câmera
    camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Criar lixeira
    createTrashBin();
    
    // Criar preenchimento (lixo)
    createTrashFill();
    
    // Criar base/chão
    const floorGeometry = new THREE.CircleGeometry(5, 32);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe0e0e0,
        roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Adicionar símbolo de reciclagem
    addRecycleSymbol();
    
    // Animação
    animate3D();
    
    // Responsividade
    window.addEventListener('resize', onWindowResize);
}

// ========================================
// CRIAR LIXEIRA
// ========================================
function createTrashBin() {
    const group = new THREE.Group();
    
    // Corpo da lixeira (cilindro)
    const bodyGeometry = new THREE.CylinderGeometry(1.2, 1, 3, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x4CAF50,
        metalness: 0.3,
        roughness: 0.4
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.position.y = 0;
    group.add(body);
    
    // Tampa
    const lidGeometry = new THREE.CylinderGeometry(1.3, 1.3, 0.2, 32);
    const lidMaterial = new THREE.MeshStandardMaterial({
        color: 0x388E3C,
        metalness: 0.4,
        roughness: 0.3
    });
    const lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.position.y = 1.6;
    lid.castShadow = true;
    group.add(lid);
    
    // Puxador da tampa
    const handleGeometry = new THREE.TorusGeometry(0.3, 0.08, 16, 32);
    const handleMaterial = new THREE.MeshStandardMaterial({
        color: 0x2E7D32,
        metalness: 0.6,
        roughness: 0.2
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.rotation.x = Math.PI / 2;
    handle.position.y = 1.8;
    group.add(handle);
    
    trashBin = group;
    scene.add(trashBin);
}

// ========================================
// CRIAR PREENCHIMENTO (LIXO)
// ========================================
function createTrashFill() {
    const fillGeometry = new THREE.CylinderGeometry(1.1, 0.9, 0.1, 32);
    const fillMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        metalness: 0.1,
        roughness: 0.9
    });
    trashFill = new THREE.Mesh(fillGeometry, fillMaterial);
    trashFill.position.y = -1.4; // Começa no fundo
    scene.add(trashFill);
}

// ========================================
// ADICIONAR SÍMBOLO DE RECICLAGEM
// ========================================
function addRecycleSymbol() {
    // Criar textura com canvas
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Desenhar símbolo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 180px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♻', 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const symbolGeometry = new THREE.PlaneGeometry(0.8, 0.8);
    const symbolMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });
    const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
    symbol.position.set(0, 0, 1.01);
    
    trashBin.add(symbol);
}

// ========================================
// ATUALIZAR LIXEIRA 3D
// ========================================
function update3DTrash(nivel) {
    if (!trashBin || !trashFill) return;
    
    // Determinar cor baseada no nível (0, 1, 2)
    let color;
    if (nivel === 0) {
        color = 0x4CAF50; // Verde - Vazia
    } else if (nivel === 1) {
        color = 0xFFC107; // Amarelo - Meio Cheia
    } else if (nivel === 2) {
        color = 0xF44336; // Vermelho - Cheia
    } else {
        color = 0x4CAF50; // Default verde
    }
    
    // Animar mudança de cor
    const bodyMaterial = trashBin.children[0].material;
    animateColorChange(bodyMaterial, color);
    
    // Atualizar altura do lixo
    // 0 = -1.4 (vazia), 1 = -0.2 (meio), 2 = 1.0 (cheia)
    const minY = -1.4;
    const maxY = 1.0;
    const targetY = minY + ((nivel / 2) * (maxY - minY));
    
    // Animar altura
    animatePosition(trashFill, targetY);
    
    // Adicionar balanço se cheia (nivel = 2)
    if (nivel === 2) {
        addShakeAnimation();
    }
}

// ========================================
// ANIMAÇÕES
// ========================================
function animateColorChange(material, targetColor) {
    const currentColor = material.color.getHex();
    if (currentColor !== targetColor) {
        const steps = 30;
        let step = 0;
        
        const interval = setInterval(() => {
            step++;
            const t = step / steps;
            material.color.setHex(interpolateColor(currentColor, targetColor, t));
            
            if (step >= steps) {
                clearInterval(interval);
            }
        }, 20);
    }
}

function animatePosition(object, targetY) {
    const startY = object.position.y;
    const steps = 30;
    let step = 0;
    
    const interval = setInterval(() => {
        step++;
        const t = step / steps;
        object.position.y = startY + (targetY - startY) * easeInOutQuad(t);
        
        if (step >= steps) {
            clearInterval(interval);
        }
    }, 20);
}

function addShakeAnimation() {
    if (!trashBin.userData.shaking) {
        trashBin.userData.shaking = true;
        const originalRotation = trashBin.rotation.z;
        let frame = 0;
        
        const shake = setInterval(() => {
            frame++;
            trashBin.rotation.z = originalRotation + Math.sin(frame * 0.5) * 0.05;
            
            if (frame > 20) {
                clearInterval(shake);
                trashBin.rotation.z = originalRotation;
                trashBin.userData.shaking = false;
            }
        }, 50);
    }
}

// ========================================
// LOOP DE ANIMAÇÃO 3D
// ========================================
function animate3D() {
    requestAnimationFrame(animate3D);
    
    // Rotação suave da lixeira
    if (trashBin) {
        trashBin.rotation.y += 0.005;
    }
    
    renderer.render(scene, camera);
}

// ========================================
// RESPONSIVIDADE 3D
// ========================================
function onWindowResize() {
    const container = document.getElementById('trashContainer');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// ========================================
// ATUALIZAR ESTATÍSTICAS
// ========================================
function updateStats(data) {
    const totalLeituras = document.getElementById('totalLeituras');
    const alertasCriticos = document.getElementById('alertasCriticos');
    
    const oldTotal = parseInt(totalLeituras.textContent) || 0;
    const newTotal = data.length;
    animateNumber(totalLeituras, oldTotal, newTotal, 500);
    
    // Contar lixeiras cheias (nível = 2)
    const criticos = data.filter(item => parseFloat(item.nivel) === 2).length;
    const oldCriticos = parseInt(alertasCriticos.textContent) || 0;
    animateNumber(alertasCriticos, oldCriticos, criticos, 500);
    
    // Mostrar notificação se houver novo alerta crítico
    if (criticos > oldCriticos && criticos > 0) {
        showNotification('⚠️ Novo alerta: Lixeira CHEIA!', 'critico');
    }
}

// ========================================
// STATUS DE CONEXÃO
// ========================================
function updateConnectionStatus(connected) {
    const statusDot = document.getElementById('connectionDot');
    const statusText = document.getElementById('connectionStatus');
    
    if (connected) {
        statusDot.classList.remove('offline');
        statusText.textContent = 'Conectado';
    } else {
        statusDot.classList.add('offline');
        statusText.textContent = 'Desconectado';
    }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================
function formatDate(date) {
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatTime(date) {
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function interpolateColor(color1, color2, factor) {
    const c1 = {
        r: (color1 >> 16) & 0xff,
        g: (color1 >> 8) & 0xff,
        b: color1 & 0xff
    };
    const c2 = {
        r: (color2 >> 16) & 0xff,
        g: (color2 >> 8) & 0xff,
        b: color2 & 0xff
    };
    
    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));
    
    return (r << 16) | (g << 8) | b;
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ========================================
// ANIMAÇÃO DE NÚMEROS
// ========================================
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (end - start) * easeInOutQuad(progress);
        element.textContent = Math.round(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ========================================
// ADICIONAR NOTIFICAÇÃO VISUAL
// ========================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'critico' ? '#F44336' : type === 'atencao' ? '#FFC107' : '#4CAF50'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
