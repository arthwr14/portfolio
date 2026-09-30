/* ==========================================================================
   CONFIGURAÇÃO - edite aqui seus dados de contato
   ========================================================================== */

const CONFIG = {
    // Número com DDI + DDD, só dígitos. Cada botão envia a mensagem do seu atributo data-wa.
    whatsapp: '5511975868098',
    // E-mail que recebe as mensagens do formulário
    email: 'arthurtt.contato@gmail.com',
    // Links completos das redes. Deixe vazio ('') para esconder o botão.
    social: {
        instagram: '',
        linkedin: '',
        github: ''
    }
};

/* ==========================================================================
   WHATSAPP & REDES SOCIAIS
   ========================================================================== */

function whatsappLink(message) {
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message || '')}`;
}

function initContactLinks() {
    document.querySelectorAll('[data-wa]').forEach(link => {
        if (CONFIG.whatsapp) {
            link.href = whatsappLink(link.dataset.wa);
            link.target = '_blank';
            link.rel = 'noopener';
        } else {
            // Sem número configurado, os botões levam ao formulário de contato
            link.href = '#contato';
        }
    });

    if (!CONFIG.whatsapp) {
        document.querySelector('.wa-float')?.remove();
    }

    document.querySelectorAll('[data-social]').forEach(link => {
        const url = CONFIG.social[link.dataset.social];
        if (url) {
            link.href = url;
            link.hidden = false;
        }
    });
}

/* ==========================================================================
   MENU MOBILE
   ========================================================================== */

function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav-links');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
        document.body.classList.toggle('nav-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };

    toggle.addEventListener('click', () => {
        setOpen(!document.body.classList.contains('nav-open'));
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setOpen(false);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) setOpen(false);
    });
}

/* ==========================================================================
   FORMULÁRIO DE CONTATO
   Envia via FormSubmit (https://formsubmit.co), sem backend próprio.
   Na primeira mensagem, o FormSubmit manda um e-mail de ativação para
   CONFIG.email - é só clicar no link para começar a receber.
   ========================================================================== */

function initContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form || !status) return;

    const setStatus = (msg, type) => {
        status.textContent = msg;
        status.className = `form-status ${type || ''}`;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        setStatus('', '');

        const data = Object.fromEntries(new FormData(form));
        data._subject = `Novo pedido de orçamento: ${data.tipo_de_projeto} - ${data.nome}`;
        data._template = 'table';
        data._replyto = data.email;

        try {
            const response = await fetch(`https://formsubmit.co/ajax/${CONFIG.email}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok || String(result.success) === 'false') {
                throw new Error(result.message || 'Falha no envio');
            }

            form.reset();
            setStatus('Mensagem enviada! Obrigado pelo contato, vou te responder o mais rápido possível.', 'success');
        } catch (err) {
            const fallback = CONFIG.whatsapp ? 'pelo WhatsApp' : `pelo e-mail ${CONFIG.email}`;
            setStatus(`Não foi possível enviar agora. Tente novamente ou fale comigo ${fallback}.`, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

/* ==========================================================================
   ENDEREÇO NOS CARTÕES DE PROJETO
   Mostra o domínio real onde o site estiver publicado (ex.: seusite.com.br/demos/...)
   ========================================================================== */

function initProjectUrls() {
    if (!location.host) return;
    document.querySelectorAll('.projeto-preview').forEach(card => {
        const label = card.querySelector('.mockup-url');
        if (!label) return;
        const url = new URL(card.getAttribute('href'), location.href);
        label.textContent = url.host + url.pathname.replace(/\.html$/, '');
    });
}

/* ==========================================================================
   INICIALIZAÇÃO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initContactLinks();
    initMobileMenu();
    initContactForm();
    initProjectUrls();

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
});
