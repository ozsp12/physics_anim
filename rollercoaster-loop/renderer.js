(function (root) {
  'use strict';

  function createRenderer(canvas, wrap, ui, simulation) {
    const ctx = canvas.getContext('2d');
    const TAU = Math.PI * 2;
    let view = null;

    function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

    function computeView(state, width, height) {
      const rampStart = state.ramp.points[0].x;
      const xMin = rampStart - 0.45 * state.R;
      const xMax = Math.max(3.3 * state.R, 4.8);
      const yMin = -0.32 * Math.max(state.R, 1);
      const yMax = Math.max(state.h, 2 * state.R) + 0.6 * Math.max(state.R, 1);
      const marginX = 48;
      const marginY = 42;
      const scale = Math.min(
        (width - 2 * marginX) / Math.max(1, xMax - xMin),
        (height - 2 * marginY) / Math.max(1, yMax - yMin)
      );
      const usedW = (xMax - xMin) * scale;
      const usedH = (yMax - yMin) * scale;
      return { width, height, xMin, xMax, yMin, yMax, scale, left: (width - usedW) / 2, top: (height - usedH) / 2 };
    }

    function toScreen(x, y) {
      return { x: view.left + (x - view.xMin) * view.scale, y: view.top + (view.yMax - y) * view.scale };
    }

    function resize(state) {
      const rect = wrap.getBoundingClientRect();
      const dpr = clamp(root.devicePixelRatio || 1, 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      view = computeView(state, rect.width, rect.height);
      draw(state);
    }

    function drawGrid(state) {
      if (!state.showGrid) return;
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(145, 175, 210, 0.10)';
      ctx.fillStyle = 'rgba(170, 196, 225, 0.56)';
      ctx.font = '11px system-ui, sans-serif';
      const step = view.scale > 90 ? 0.5 : view.scale > 46 ? 1 : 2;
      for (let x = Math.ceil(view.xMin / step) * step; x <= view.xMax; x += step) {
        const a = toScreen(x, view.yMin); const b = toScreen(x, view.yMax);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      for (let y = Math.ceil(Math.max(0, view.yMin) / step) * step; y <= view.yMax; y += step) {
        const a = toScreen(view.xMin, y); const b = toScreen(view.xMax, y);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        if (y > 0) ctx.fillText(`${ui.format(y, step < 1 ? 1 : 0)} m`, a.x + 5, a.y - 4);
      }
      ctx.restore();
    }

    function drawGround() {
      const a = toScreen(view.xMin, 0); const b = toScreen(view.xMax, 0);
      ctx.save(); ctx.strokeStyle = 'rgba(213, 229, 247, 0.30)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
    }

    function drawTrack(state) {
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const drawPath = (stroke, width) => {
        ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.beginPath();
        state.ramp.points.forEach((p, i) => { const s = toScreen(p.x, p.y); if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y); });
        const c = toScreen(0, state.R); const bottom = toScreen(0, 0);
        ctx.moveTo(bottom.x, bottom.y); ctx.arc(c.x, c.y, state.R * view.scale, Math.PI / 2, Math.PI / 2 + TAU, false);
        const end = toScreen(Math.max(3.1 * state.R, 4.5), 0); ctx.moveTo(bottom.x, bottom.y); ctx.lineTo(end.x, end.y); ctx.stroke();
      };
      drawPath('rgba(0,0,0,0.48)', 12); drawPath('#dce9f7', 5); drawPath('rgba(85,200,255,0.55)', 1.5); ctx.restore();
    }

    function drawMeasurements(state) {
      if (!state.showGrid) return;
      const start = state.ramp.points[0];
      const hb = toScreen(start.x - 0.23 * state.R, 0); const ht = toScreen(start.x - 0.23 * state.R, state.h);
      const c = toScreen(0, state.R); const r = toScreen(state.R, state.R);
      ctx.save(); ctx.strokeStyle = 'rgba(255,202,106,0.9)'; ctx.fillStyle = 'rgba(255,226,169,0.96)'; ctx.lineWidth = 1.5; ctx.setLineDash([5,4]);
      ctx.beginPath(); ctx.moveTo(hb.x,hb.y); ctx.lineTo(ht.x,ht.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(c.x,c.y); ctx.lineTo(r.x,r.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = '600 13px system-ui, sans-serif'; ctx.fillText(`h = ${ui.format(state.h)} m`, ht.x + 7, (ht.y + hb.y) / 2); ctx.fillText(`R = ${ui.format(state.R)} m`, (c.x + r.x) / 2 - 20, c.y - 8); ctx.restore();
    }

    function drawTrail(state) {
      if (!state.showTrail || state.trail.length < 2) return;
      ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(85,200,255,0.42)'; ctx.beginPath();
      state.trail.forEach((p, i) => { const s = toScreen(p.x,p.y); if (i === 0) ctx.moveTo(s.x,s.y); else ctx.lineTo(s.x,s.y); }); ctx.stroke(); ctx.restore();
    }

    function arrow(x1,y1,x2,y2,color,label) {
      const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy); if (len < 1) return; const ux=dx/len, uy=dy/len, head=8;
      ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-head*ux+0.55*head*uy,y2-head*uy-0.55*head*ux); ctx.lineTo(x2-head*ux-0.55*head*uy,y2-head*uy+0.55*head*ux); ctx.closePath(); ctx.fill();
      if (label) { ctx.font='700 12px system-ui, sans-serif'; ctx.fillText(label,x2+5,y2-5); } ctx.restore();
    }

    function drawVectors(state, center) {
      if (!state.showVectors || ['ready','done'].includes(state.phase)) return;
      const vel = state.velocityVector(); const mag = Math.hypot(vel.x,vel.y);
      if (mag > 0.02) { const length=clamp(mag*5,20,92); arrow(center.x,center.y,center.x+vel.x/mag*length,center.y-vel.y/mag*length,'#55c8ff','v'); }
      arrow(center.x,center.y,center.x,center.y+45,'#ffca6a','mg');
      if (state.phase === 'loop' && state.normal > 0) {
        const c=toScreen(0,state.R), dx=c.x-center.x, dy=c.y-center.y, d=Math.max(1,Math.hypot(dx,dy)), length=clamp(state.normal/(state.g)*17,12,80);
        arrow(center.x,center.y,center.x+dx/d*length,center.y+dy/d*length,'#7cf1c8','N');
      }
    }

    function drawParticle(state) {
      const p=toScreen(state.x,state.y); const radius=clamp(0.12*state.R*view.scale,8,15);
      ctx.save(); ctx.shadowColor='rgba(85,200,255,0.62)'; ctx.shadowBlur=18; const grad=ctx.createRadialGradient(p.x-radius*0.3,p.y-radius*0.35,1,p.x,p.y,radius);
      grad.addColorStop(0,'#f4fbff'); grad.addColorStop(0.34,'#7dd8ff'); grad.addColorStop(1,'#1876a8'); ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(p.x,p.y,radius,0,TAU); ctx.fill(); ctx.restore();
      drawVectors(state,p);
    }

    function draw(state) {
      if (!view || !state.ramp) return;
      ctx.clearRect(0,0,view.width,view.height); const bg=ctx.createLinearGradient(0,0,0,view.height); bg.addColorStop(0,'#07111f'); bg.addColorStop(1,'#0b1729'); ctx.fillStyle=bg; ctx.fillRect(0,0,view.width,view.height);
      drawGrid(state); drawGround(); drawTrail(state); drawTrack(state); drawMeasurements(state); drawParticle(state);
    }

    return { resize, draw };
  }

  root.VerticalLoopRenderer = Object.freeze({ createRenderer });
})(window);
