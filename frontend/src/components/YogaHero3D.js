import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * WebGL hero: a glowing 17-keypoint skeleton held in Tree pose, slowly rotating.
 * Mirrors the same joints MoveNet detects in the live session.
 */

// Joint positions (y-up, origin near the hips) forming Tree pose.
const JOINTS = {
    nose: [0, 1.56, 0.06],
    left_eye: [-0.05, 1.61, 0.09],
    right_eye: [0.05, 1.61, 0.09],
    left_ear: [-0.1, 1.58, 0.0],
    right_ear: [0.1, 1.58, 0.0],
    left_shoulder: [-0.22, 1.34, 0],
    right_shoulder: [0.22, 1.34, 0],
    left_elbow: [-0.3, 1.74, 0],
    right_elbow: [0.3, 1.74, 0],
    left_wrist: [-0.06, 2.04, 0],
    right_wrist: [0.06, 2.04, 0],
    left_hip: [-0.15, 0.95, 0],
    right_hip: [0.15, 0.95, 0],
    left_knee: [-0.16, 0.5, 0],
    left_ankle: [-0.16, 0.04, 0],
    right_knee: [0.52, 0.62, 0.02],
    right_ankle: [-0.03, 0.76, 0.06],
};

const BONES = [
    ['nose', 'left_eye'], ['nose', 'right_eye'],
    ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'],
    ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    ['left_hip', 'left_knee'], ['left_knee', 'left_ankle'],
    ['right_hip', 'right_knee'], ['right_knee', 'right_ankle'],
];

export default function YogaHero3D({ className = '' }) {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return undefined;

        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        } catch {
            return undefined; // WebGL unavailable — the CSS fallback stays visible
        }

        const width = mount.clientWidth || 600;
        const height = mount.clientHeight || 600;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
        camera.position.set(0, 1.15, 4.2);
        camera.lookAt(0, 1.05, 0);

        const figure = new THREE.Group();
        scene.add(figure);

        // --- Joints -----------------------------------------------------------
        const jointGeo = new THREE.SphereGeometry(0.045, 16, 16);
        const jointMat = new THREE.MeshBasicMaterial({ color: 0xdce9ff });
        const haloGeo = new THREE.SphereGeometry(0.085, 16, 16);
        const haloMat = new THREE.MeshBasicMaterial({
            color: 0x3b8cff, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false,
        });

        Object.values(JOINTS).forEach(([x, y, z]) => {
            const j = new THREE.Mesh(jointGeo, jointMat);
            j.position.set(x, y, z);
            figure.add(j);
            const halo = new THREE.Mesh(haloGeo, haloMat);
            halo.position.set(x, y, z);
            figure.add(halo);
        });

        // --- Bones ------------------------------------------------------------
        const bonePts = [];
        BONES.forEach(([a, b]) => {
            bonePts.push(...JOINTS[a], ...JOINTS[b]);
        });
        const boneGeo = new THREE.BufferGeometry();
        boneGeo.setAttribute('position', new THREE.Float32BufferAttribute(bonePts, 3));
        const boneMat = new THREE.LineBasicMaterial({
            color: 0x4d9bff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending,
        });
        const bones = new THREE.LineSegments(boneGeo, boneMat);
        figure.add(bones);

        // --- Ground ring ------------------------------------------------------
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.65, 0.72, 64),
            new THREE.MeshBasicMaterial({ color: 0x1a6dff, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        figure.add(ring);

        // --- Ambient particles ------------------------------------------------
        const COUNT = 220;
        const pPos = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i += 1) {
            pPos[i * 3] = (Math.random() - 0.5) * 6;
            pPos[i * 3 + 1] = Math.random() * 3.4;
            pPos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 0.5;
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
        const particles = new THREE.Points(
            pGeo,
            new THREE.PointsMaterial({
                color: 0x8ec2ff, size: 0.022, transparent: true, opacity: 0.55,
                blending: THREE.AdditiveBlending, depthWrite: false,
            })
        );
        scene.add(particles);

        // --- Animation --------------------------------------------------------
        let frameId;
        const clock = new THREE.Clock();

        const render = () => {
            const t = clock.getElapsedTime();
            if (!reduceMotion) {
                figure.rotation.y = Math.sin(t * 0.25) * 0.55;
                figure.position.y = Math.sin(t * 0.8) * 0.025;
                boneMat.opacity = 0.7 + Math.sin(t * 1.6) * 0.2;
                particles.rotation.y = t * 0.03;
            }
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(render);
        };
        render();

        const onResize = () => {
            const w = mount.clientWidth || width;
            const h = mount.clientHeight || height;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', onResize);
            [jointGeo, haloGeo, boneGeo, pGeo, ring.geometry].forEach((g) => g.dispose());
            [jointMat, haloMat, boneMat, ring.material, particles.material].forEach((m) => m.dispose());
            renderer.dispose();
            if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className={className} aria-hidden="true" />;
}
