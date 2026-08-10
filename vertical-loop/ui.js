(function (root) {
  'use strict';

  const STRINGS = {
    'pt-BR': {
      title: 'Loop Vertical — Simulação Interativa',
      heading: 'Loop vertical: desafio de energia e contato',
      subtitle: 'Ajuste a altura inicial h e o raio R. Tente completar o loop usando a menor altura possível.',
      target: 'Meta teórica: h = 2,5R',
      parameters: 'Parâmetros', height: 'Altura inicial h', radius: 'Raio do loop R', time: 'Velocidade da simulação',
      start: 'Iniciar', pause: 'Pausar', resume: 'Continuar', reset: 'Reiniciar', replay: 'Jogar novamente',
      critical: 'Definir h crítico = 2,5R', vectors: 'Mostrar vetores de força e velocidade', trail: 'Mostrar rastro', grid: 'Mostrar grade e medidas',
      prediction: 'Previsão', state: 'Estado', speed: 'Velocidade', score: 'Pontuação',
      kinetic: 'Energia cinética', potential: 'Energia potencial', mechanical: 'Energia mecânica',
      model: 'Modelo físico utilizado',
      modelText: 'A partícula parte do repouso e não há atrito. A rampa e o loop são integrados com o mesmo passo temporal. No loop, v² = 2g[h − R(1 − cos θ)] e N/m = v²/R + g cos θ. O limite ideal para completar o loop é h ≥ 5R/2.',
      shortcuts: 'Atalhos: espaço inicia ou pausa; tecla R reinicia. O corpo é tratado como partícula deslizante, não como esfera rolante.',
      ready: 'Pronto', ramp: 'Descendo', rampBack: 'Retornando', loop: 'No loop', projectile: 'Voo livre', exit: 'Loop completo', done: 'Encerrado', completed: 'Concluído',
      prompt: 'Pressione Iniciar ou a barra de espaço', running: 'Simulação em execução', paused: 'Simulação pausada', lost: 'Contato perdido: movimento balístico',
      loopComplete: 'Loop completo', returnStart: 'A partícula retornou ao ponto de partida', recontact: 'A partícula reencontrou o trilho após perder contato', ground: 'A partícula atingiu o nível do solo',
      predReturn: 'Retorna pela pista', predSide: 'Limite lateral', predDetach: 'Perde contato', predCritical: 'Caso crítico', predComplete: 'Completa o loop',
      predReturnText: angle => `A energia cinética zera aproximadamente em θ = ${angle}°.` ,
      predSideText: 'A partícula alcança o ponto lateral com velocidade nula.',
      predDetachText: angle => `A força normal zera antes do topo, aproximadamente em θ = ${angle}°.` ,
      predCriticalText: 'No topo, a força normal tende a zero. Em aritmética exata, a partícula completa o loop.',
      predCompleteText: margin => `Há margem de contato no topo. A altura excede o mínimo em ${margin} m.`
    },
    en: {
      title: 'Vertical Loop — Interactive Simulation',
      heading: 'Vertical loop: energy and contact challenge',
      subtitle: 'Adjust the release height h and loop radius R. Try to complete the loop with the smallest possible height.',
      target: 'Theoretical target: h = 2.5R',
      parameters: 'Parameters', height: 'Release height h', radius: 'Loop radius R', time: 'Simulation speed',
      start: 'Start', pause: 'Pause', resume: 'Resume', reset: 'Reset', replay: 'Play again',
      critical: 'Set critical h = 2.5R', vectors: 'Show force and velocity vectors', trail: 'Show trail', grid: 'Show grid and measurements',
      prediction: 'Prediction', state: 'State', speed: 'Speed', score: 'Score',
      kinetic: 'Kinetic energy', potential: 'Potential energy', mechanical: 'Mechanical energy',
      model: 'Physical model',
      modelText: 'The particle starts from rest and friction is neglected. The ramp and loop are integrated with the same timestep. In the loop, v² = 2g[h − R(1 − cos θ)] and N/m = v²/R + g cos θ. The ideal threshold for completing the loop is h ≥ 5R/2.',
      shortcuts: 'Shortcuts: Space starts or pauses; R resets. The body is treated as a sliding point particle, not a rolling sphere.',
      ready: 'Ready', ramp: 'Descending', rampBack: 'Returning', loop: 'In loop', projectile: 'Free flight', exit: 'Loop complete', done: 'Finished', completed: 'Completed',
      prompt: 'Press Start or the Space bar', running: 'Simulation running', paused: 'Simulation paused', lost: 'Contact lost: ballistic motion',
      loopComplete: 'Loop complete', returnStart: 'The particle returned to the starting point', recontact: 'The particle met the track again after losing contact', ground: 'The particle reached ground level',
      predReturn: 'Returns on the track', predSide: 'Side limit', predDetach: 'Loses contact', predCritical: 'Critical case', predComplete: 'Completes the loop',
      predReturnText: angle => `Kinetic energy vanishes at approximately θ = ${angle}°.` ,
      predSideText: 'The particle reaches the side point with zero speed.',
      predDetachText: angle => `The normal force vanishes before the top, at approximately θ = ${angle}°.` ,
      predCriticalText: 'At the top, the normal force tends to zero. In exact arithmetic, the particle completes the loop.',
      predCompleteText: margin => `There is a positive contact margin at the top. The height exceeds the minimum by ${margin} m.`
    }
  };

  function resolveLocale() {
    const requested = new URLSearchParams(root.location.search).get('lang');
    return requested === 'en' ? 'en' : 'pt-BR';
  }

  function createUI(physics) {
    const locale = resolveLocale();
    const t = STRINGS[locale];
    const el = {};
    document.querySelectorAll('[id]').forEach(node => { el[node.id] = node; });

    function format(value, digits = 2) {
      return Number(value).toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    }

    function applyLanguage() {
      document.documentElement.lang = locale;
      document.title = t.title;
      const map = {
        pageHeading: t.heading, pageSubtitle: t.subtitle, challengeChip: t.target, parametersTitle: t.parameters,
        heightLabel: t.height, radiusLabel: t.radius, timeLabel: t.time, playButton: t.start, resetButton: t.reset,
        criticalButton: t.critical, vectorsLabel: t.vectors, trailLabel: t.trail, gridLabel: t.grid, predictionHeading: t.prediction,
        stateLabel: t.state, speedLabel: t.speed, scoreLabel: t.score, kineticLabel: t.kinetic, potentialLabel: t.potential,
        totalLabel: t.mechanical, modelSummary: t.model, modelText: t.modelText, footerText: t.shortcuts
      };
      Object.entries(map).forEach(([id, value]) => { if (el[id]) el[id].textContent = value; });
      if (el.langPt) el.langPt.setAttribute('aria-current', locale === 'pt-BR' ? 'page' : 'false');
      if (el.langEn) el.langEn.setAttribute('aria-current', locale === 'en' ? 'page' : 'false');
    }

    function prediction(height, radius) {
      const regime = physics.classify(height, radius);
      const margin = format(height - physics.criticalHeight(radius), 2);
      let title; let text;
      if (regime === 'return') {
        title = t.predReturn;
        text = t.predReturnText(format(physics.turningAngle(height, radius) * 180 / Math.PI, 1));
      } else if (regime === 'side_limit') {
        title = t.predSide; text = t.predSideText;
      } else if (regime === 'detach') {
        title = t.predDetach;
        text = t.predDetachText(format(physics.detachmentAngle(height, radius) * 180 / Math.PI, 1));
      } else if (regime === 'critical') {
        title = t.predCritical; text = t.predCriticalText;
      } else {
        title = t.predComplete; text = t.predCompleteText(margin);
      }
      el.predictionTitle.textContent = title;
      el.predictionText.textContent = text;
    }

    function phaseLabel(phase, completed) {
      if (phase === 'done' && completed) return t.completed;
      return t[phase] || phase;
    }

    function announce(text) {
      if (el.statusAnnouncer && el.statusAnnouncer.textContent !== text) el.statusAnnouncer.textContent = text;
    }

    function setLanguageLinks() {
      if (el.langPt) el.langPt.href = '?lang=pt-BR';
      if (el.langEn) el.langEn.href = '?lang=en';
    }

    applyLanguage();
    setLanguageLinks();
    return { locale, t, el, format, prediction, phaseLabel, announce };
  }

  root.VerticalLoopUI = Object.freeze({ createUI });
})(window);
