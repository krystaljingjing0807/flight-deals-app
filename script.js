(() => {
  document.querySelectorAll('[data-tabs]').forEach((tabGroup) => {
    const buttons = tabGroup.parentElement.querySelectorAll('.tab-btn');
    const panels = tabGroup.querySelectorAll('.tab-panel');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        panels.forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.target);
        if (target) target.classList.add('active');
      });
    });
  });

  const toggleBtn = document.querySelector('[data-toggle]');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const target = document.querySelector(toggleBtn.dataset.toggle);
      if (target) target.classList.toggle('compact');
    });
  }

  const hint = document.getElementById('map-hint');
  document.querySelectorAll('.map-pin').forEach((pin) => {
    pin.addEventListener('click', () => {
      if (hint) hint.textContent = `已选 ${pin.dataset.city}：可查看最低价、推荐出行天数与直飞/中转情况。`;
      document.querySelectorAll('.map-pin').forEach((p) => p.classList.remove('active'));
      pin.classList.add('active');
    });
  });
})();
