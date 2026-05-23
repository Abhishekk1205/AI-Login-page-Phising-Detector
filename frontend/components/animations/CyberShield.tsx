"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * CyberShield — Animated Three.js 3D rotating shield in the hero section.
 */
export default function CyberShield() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene
    const scene  = new THREE.Scene();
    const W      = mount.clientWidth  || 400;
    const H      = mount.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Shield Geometry (octahedron as stand-in for shield shape) ───────────
    const shieldGeo = new THREE.OctahedronGeometry(1.2, 1);
    const shieldMat = new THREE.MeshStandardMaterial({
      color:       0x00ffcc,
      emissive:    0x003322,
      metalness:   0.8,
      roughness:   0.2,
      wireframe:   false,
      transparent: true,
      opacity:     0.85,
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    scene.add(shield);

    // ── Wireframe Overlay ─────────────────────────────────────────────────
    const wireGeo = new THREE.OctahedronGeometry(1.25, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color:       0x00ffcc,
      wireframe:   true,
      transparent: true,
      opacity:     0.25,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);

    // ── Outer Ring ────────────────────────────────────────────────────────
    const ringGeo = new THREE.TorusGeometry(1.8, 0.015, 8, 80);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 });
    const ring    = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // ── Particle Field ────────────────────────────────────────────────────
    const particleCount  = 200;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3]     = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x00ffcc, size: 0.03, transparent: true, opacity: 0.6 });
    const particles   = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Lights ────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x00ffcc, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(2, 3, 5);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x38bdf8, 2, 10);
    pointLight.position.set(-3, -2, 3);
    scene.add(pointLight);

    // ── Animate ───────────────────────────────────────────────────────────
    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.005;

      shield.rotation.y += 0.008;
      shield.rotation.x  = Math.sin(t) * 0.2;
      wire.rotation.y    = shield.rotation.y;
      wire.rotation.x    = shield.rotation.x;
      ring.rotation.z   += 0.004;
      particles.rotation.y += 0.001;

      // Pulsing emissive
      (shieldMat as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.15;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      const W2 = mount.clientWidth || 400;
      const H2 = mount.clientHeight || 400;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{ minHeight: 360 }}
      aria-hidden="true"
    />
  );
}
