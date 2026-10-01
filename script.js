const form = document.querySelector('#leadForm');
const statusEl = document.querySelector('#formStatus');
const phoneInput = form.querySelector('input[name="whatsapp"]');
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

document.querySelector('#year').textContent = new Date().getFullYear();

menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

phoneInput.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  else if (v.length > 2) v = v.replace(/(\d{2})(\d+)/, '($1) $2');
  else if (v.length) v = '(' + v;
  e.target.value = v;
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form).entries());
  data.createdAt = new Date().toISOString();

  // Backup local: mantém uma cópia do lead neste navegador.
  const leads = JSON.parse(localStorage.getItem('luzSolarLeads') || '[]');
  leads.push(data);
  localStorage.setItem('luzSolarLeads', JSON.stringify(leads));

  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando...';
  statusEl.textContent = 'Enviando seus dados para a Luz Solar Brasil...';
  statusEl.style.color = '#495057';

  const emailPayload = {
    _subject: 'Novo lead pelo site - Luz Solar Brasil',
    _template: 'table',
    _captcha: 'false',
    Nome: data.nome,
    WhatsApp: data.whatsapp,
    Cidade: data.cidade,
    'Conta de luz média': `R$ ${data.conta}`,
    Perfil: data.perfil,
    'Tipo de imóvel': data.imovel,
    'Data do envio': new Date(data.createdAt).toLocaleString('pt-BR')
  };

  try {
    const response = await fetch('https://formsubmit.co/ajax/Luzsolarbrasil14@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) throw new Error('Falha no envio');

    statusEl.textContent = 'Dados enviados com sucesso! Nossa equipe entrará em contato.';
    statusEl.style.color = '#087d40';
    form.reset();
  } catch (error) {
    statusEl.textContent = 'Não foi possível enviar agora. Seus dados ficaram salvos para atendimento.';
    statusEl.style.color = '#b45309';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('show'); });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
