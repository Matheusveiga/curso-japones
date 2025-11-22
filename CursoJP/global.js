// Configuração do Estado
const state = {
    progress: JSON.parse(localStorage.getItem('samurai_progress')) || { aula1: 0, aula2: 0, aula3: 0 },
    apiKey: localStorage.getItem('samurai_key') || ""
};

// Sistema de Áudio (TTS)
async function playTTS(text) {
    console.log("🔊 A falar:", text);

    // Tenta usar a API do Gemini se a chave existir
    if (state.apiKey) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${state.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text }] }],
                    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } }
                })
            });
            const data = await response.json();
            if(data.candidates) {
                const audio = new Audio("data:audio/wav;base64," + data.candidates[0].content.parts[0].inlineData.data);
                audio.play();
                return;
            }
        } catch (e) {
            console.warn("Fallback para navegador:", e);
        }
    }
    
    // Fallback: Navegador
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
}

// Salvar Progresso
function saveProgress(moduleKey, percentage) {
    state.progress[moduleKey] = percentage;
    localStorage.setItem('samurai_progress', JSON.stringify(state.progress));
    console.log(`Progresso salvo: ${moduleKey} = ${percentage}%`);
}

// Inicializar e Atualizar UI
document.addEventListener('DOMContentLoaded', () => {
    // Se estivermos no index, atualiza as barras
    const bars = {
        'prog-bar-01': state.progress.aula1,
        'prog-bar-02': state.progress.aula2,
        'prog-bar-03': state.progress.aula3
    };

    for (const [id, value] of Object.entries(bars)) {
        const el = document.getElementById(id);
        if (el) el.style.width = `${value}%`;
    }
    
    // Atualiza barra global se existir
    const globalBar = document.getElementById('global-bar');
    if (globalBar) {
        const total = (state.progress.aula1 + state.progress.aula2 + state.progress.aula3) / 3;
        globalBar.style.width = `${total}%`;
    }
});