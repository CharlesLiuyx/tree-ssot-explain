// 补间系统:极简的时间驱动插值。主循环每帧调 stepTweens();tweens.size 参与「是否需要渲染」判定。

import * as THREE from 'three';

export const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOut = t => 1 - Math.pow(1 - t, 3); // 快出慢停:Zoom in / 返回时更「爽快」

export const tweens = new Set();

export function tween(dur, update, done, ease) {
  const tw = { t0: performance.now(), dur: dur * 1000, update, done, ease };
  tweens.add(tw); return tw;
}
export function cancelTween(tw) { if (tw) tweens.delete(tw); }

export function stepTweens() {
  const now = performance.now();
  for (const tw of [...tweens]) {
    const k = Math.min(1, (now - tw.t0) / tw.dur);
    tw.update((tw.ease || easeIO)(k));
    if (k >= 1) { tweens.delete(tw); tw.done && tw.done(); }
  }
}

export function tweenVec(v, to, dur, onUpdate, onDone, ease) {
  const from = v.clone(), tgt = to.clone ? to.clone() : new THREE.Vector3(to[0], to[1], to[2]);
  return tween(dur, k => { v.lerpVectors(from, tgt, k); onUpdate && onUpdate(); }, onDone, ease);
}
