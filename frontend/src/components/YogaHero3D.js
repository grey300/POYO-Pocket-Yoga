import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * WebGL hero: a glowing, ball-jointed humanoid held in Tree pose, slowly
 * rotating. Built from the same 17 keypoints MoveNet detects in the live
 * session — but fleshed out into capsule limbs, spherical joints and a lit
 * metallic body so it reads as a figure, not a wireframe stick.
 */

// Joint positions (y-up, origin near the hips) forming Tree pose.
const JOINTS = {
    nose: [0, 1.62, 0.08],
    left_eye: [-0.05, 1.66, 0.11],
    right_eye: [0.05, 1.66, 0.11],
    left_ear: [-0.11, 1.63, 0.02],
    right_ear: [0.11, 1.63, 0.02],
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

// Structural bones drawn as volumetric capsules, each with a limb radius.
// (Face joints are handled by the head, not by bones.)
const LIMBS = [
    ['left_shoulder', 'right_shoulder', 0.055],
    ['left_hip', 'right_hip', 0.06],
    ['left_shoulder', 'left_hip', 0.06],
    ['right_shoulder', 'right_hip', 0.06],
    ['left_shoulder', 'left_elbow', 0.05],
    ['left_elbow', 'left_wrist', 0.04],
    ['right_shoulder', 'right_elbow', 0.05],
    ['right_elbow', 'right_wrist', 0.04],
    ['left_hip', 'left_knee', 0.07],
    ['left_knee', 'left_ankle', 0.055],
    ['right_hip', 'right_knee', 0.07],
    ['right_knee', 'right_ankle', 0.055],
];

const FACE_KEYS = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear'];

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

        // --- Lighting: key + rim so the metal reads as 3D volume --------------
        const ambient = new THREE.AmbientLight(0x3a5480, 0.75);
        const keyLight = new THREE.DirectionalLight(0xcfe2ff, 1.5);
        keyLight.position.set(2.5, 3.5, 2.5);
        const rimLight = new THREE.DirectionalLight(0x2f7bff, 1.1);
        rimLight.position.set(-3, 1.2, -2.2);
        const fillLight = new THREE.PointLight(0x6fa8ff, 0.6, 12);
        fillLight.position.set(0, 1.2, 3);
        scene.add(ambient, keyLight, rimLight, fillLight);

        const figure = new THREE.Group();
        scene.add(figure);

        const geometries = [];
        const materials = [];
        const V = (k) => new THREE.Vector3(...JOINTS[k]);

        // --- Shared materials -------------------------------------------------
        const limbMat = new THREE.MeshStandardMaterial({
            color: 0x2f6fd6, metalness: 0.6, roughness: 0.33,
            emissive: 0x0e2f66, emissiveIntensity: 0.55,
        });
        const headMat = new THREE.MeshStandardMaterial({
            color: 0x3877dc, metalness: 0.55, roughness: 0.3,
            emissive: 0x123a72, emissiveIntensity: 0.5,
        });
        const jointMat = new THREE.MeshStandardMaterial({
            color: 0xaecbff, metalness: 0.75, roughness: 0.22,
            emissive: 0x2f6fd6, emissiveIntensity: 0.55,
        });
        const haloMat = new THREE.MeshBasicMaterial({
            color: 0x3b8cff, transparent: true, opacity: 0.22,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        materials.push(limbMat, headMat, jointMat, haloMat);

        // --- Limbs (capsules) -------------------------------------------------
        const up = new THREE.Vector3(0, 1, 0);
        LIMBS.forEach(([a, b, r]) => {
            const start = V(a);
            const end = V(b);
            const dir = new THREE.Vector3().subVectors(end, start);
            const len = dir.length();
            const geo = new THREE.CapsuleGeometry(r, Math.max(len - r * 2, 0.02), 6, 16);
            geometries.push(geo);
            const mesh = new THREE.Mesh(geo, limbMat);
            mesh.position.copy(start).add(end).multiplyScalar(0.5);
            mesh.quaternion.setFromUnitVectors(up, dir.normalize());
            figure.add(mesh);
        });

        // --- Torso core: a flattened capsule filling shoulders → hips ---------
        const shoulderMid = V('left_shoulder').add(V('right_shoulder')).multiplyScalar(0.5);
        const hipMid = V('left_hip').add(V('right_hip')).multiplyScalar(0.5);
        const torsoDir = new THREE.Vector3().subVectors(shoulderMid, hipMid);
        const torsoGeo = new THREE.CapsuleGeometry(0.12, Math.max(torsoDir.length() - 0.05, 0.02), 6, 18);
        geometries.push(torsoGeo);
        const torso = new THREE.Mesh(torsoGeo, limbMat);
        torso.position.copy(hipMid).add(shoulderMid).multiplyScalar(0.5);
        torso.quaternion.setFromUnitVectors(up, torsoDir.clone().normalize());
        torso.scale.set(1.55, 1, 0.72); // wider chest, thinner front-to-back
        figure.add(torso);

        // --- Neck + head ------------------------------------------------------
        const headCenter = new THREE.Vector3(0, 1.63, 0.04);
        const neckDir = new THREE.Vector3().subVectors(headCenter, shoulderMid);
        const neckGeo = new THREE.CapsuleGeometry(0.045, Math.max(neckDir.length() - 0.12, 0.02), 6, 14);
        geometries.push(neckGeo);
        const neck = new THREE.Mesh(neckGeo, limbMat);
        neck.position.copy(shoulderMid).add(headCenter).multiplyScalar(0.5);
        neck.quaternion.setFromUnitVectors(up, neckDir.clone().normalize());
        figure.add(neck);

        const headGeo = new THREE.SphereGeometry(0.145, 28, 28);
        geometries.push(headGeo);
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.copy(headCenter);
        head.scale.set(0.92, 1.05, 0.98);
        figure.add(head);

        // --- Joints: metallic ball joints + glow halos ------------------------
        const jointGeo = new THREE.SphereGeometry(0.052, 18, 18);
        const faceGeo = new THREE.SphereGeometry(0.018, 12, 12);
        const haloGeo = new THREE.SphereGeometry(0.1, 16, 16);
        geometries.push(jointGeo, faceGeo, haloGeo);

        Object.entries(JOINTS).forEach(([key, pos]) => {
            const isFace = FACE_KEYS.includes(key);
            const j = new THREE.Mesh(isFace ? faceGeo : jointGeo, jointMat);
            j.position.set(...pos);
            figure.add(j);
            if (!isFace) {
                const halo = new THREE.Mesh(haloGeo, haloMat);
                halo.position.set(...pos);
                figure.add(halo);
            }
        });

        // --- Ground ring ------------------------------------------------------
        const ringGeo = new THREE.RingGeometry(0.65, 0.72, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x1a6dff, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
        geometries.push(ringGeo);
        materials.push(ringMat);
        const ring = new THREE.Mesh(ringGeo, ringMat);
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
        const particleMat = new THREE.PointsMaterial({
            color: 0x8ec2ff, size: 0.022, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        geometries.push(pGeo);
        materials.push(particleMat);
        const particles = new THREE.Points(pGeo, particleMat);
        scene.add(particles);

        // --- Animation --------------------------------------------------------
        let frameId;
        const clock = new THREE.Clock();

        const render = () => {
            const t = clock.getElapsedTime();
            if (!reduceMotion) {
                figure.rotation.y = Math.sin(t * 0.25) * 0.55;
                figure.position.y = Math.sin(t * 0.8) * 0.025;
                limbMat.emissiveIntensity = 0.45 + Math.sin(t * 1.6) * 0.18;
                jointMat.emissiveIntensity = 0.45 + Math.sin(t * 1.6 + 1) * 0.2;
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
            geometries.forEach((g) => g.dispose());
            materials.forEach((m) => m.dispose());
            renderer.dispose();
            if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className={className} aria-hidden="true" />;
}
