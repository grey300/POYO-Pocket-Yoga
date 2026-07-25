import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * WebGL hero: a futuristic dark-carbon android seated in a lotus / meditation
 * pose, slowly breathing and rocking. Built around the same 17 keypoints
 * MoveNet detects in the live session — the joints are the figure's glowing
 * energy cores, and the body is sculpted armor around them.
 */

// Seated lotus pose (y-up, ground at y = 0). Legs crossed low, hands on knees,
// spine tall, head level.
const JOINTS = {
    nose: [0, 1.28, 0.10],
    left_eye: [-0.045, 1.31, 0.13],
    right_eye: [0.045, 1.31, 0.13],
    left_ear: [-0.10, 1.29, 0.03],
    right_ear: [0.10, 1.29, 0.03],
    left_shoulder: [-0.21, 1.00, 0],
    right_shoulder: [0.21, 1.00, 0],
    left_elbow: [-0.31, 0.70, 0.06],
    right_elbow: [0.31, 0.70, 0.06],
    left_wrist: [-0.42, 0.34, 0.17],
    right_wrist: [0.42, 0.34, 0.17],
    left_hip: [-0.17, 0.30, -0.02],
    right_hip: [0.17, 0.30, -0.02],
    left_knee: [-0.44, 0.12, 0.15],
    left_ankle: [0.06, 0.22, 0.27],
    right_knee: [0.44, 0.12, 0.15],
    right_ankle: [-0.06, 0.26, 0.31],
};

// Structural bones → sculpted limbs. [a, b, radius, hasPlate, hasCollar]
const LIMBS = [
    ['left_shoulder', 'left_elbow', 0.052, true, false],
    ['left_elbow', 'left_wrist', 0.042, false, true],
    ['right_shoulder', 'right_elbow', 0.052, true, false],
    ['right_elbow', 'right_wrist', 0.042, false, true],
    ['left_hip', 'left_knee', 0.075, true, false],
    ['left_knee', 'left_ankle', 0.06, false, true],
    ['right_hip', 'right_knee', 0.075, true, false],
    ['right_knee', 'right_ankle', 0.06, false, true],
];

const FACE_KEYS = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear'];
const MAJOR_JOINTS = [
    'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
    'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
    'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
];

const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

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
            return undefined; // WebGL unavailable — CSS fallback stays visible
        }

        const width = mount.clientWidth || 600;
        const height = mount.clientHeight || 600;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
        camera.position.set(0, 0.95, 3.55);
        camera.lookAt(0, 0.62, 0);

        // --- Reflections: studio env so the dark metal isn't flat ------------
        let pmrem;
        let envRT;
        try {
            pmrem = new THREE.PMREMGenerator(renderer);
            envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
            scene.environment = envRT.texture;
        } catch { /* reflections are optional */ }

        // --- Lighting ---------------------------------------------------------
        const ambient = new THREE.AmbientLight(0x2a3c5c, 0.7);
        const keyLight = new THREE.DirectionalLight(0xbcd6ff, 1.6);
        keyLight.position.set(2.6, 3.4, 2.4);
        const rimLight = new THREE.DirectionalLight(0x2f7bff, 1.4);
        rimLight.position.set(-3, 1.4, -2.4);
        const underGlow = new THREE.PointLight(0x3b8cff, 0.7, 8);
        underGlow.position.set(0, 0.4, 1.2);
        scene.add(ambient, keyLight, rimLight, underGlow);

        const figure = new THREE.Group();
        scene.add(figure);

        const geometries = [];
        const materials = [];
        const track = (g) => { geometries.push(g); return g; };

        // --- Materials --------------------------------------------------------
        const carbonMat = new THREE.MeshPhysicalMaterial({
            color: 0x0c1220, metalness: 0.95, roughness: 0.4,
            clearcoat: 0.6, clearcoatRoughness: 0.35, envMapIntensity: 1.1,
        });
        const plateMat = new THREE.MeshPhysicalMaterial({
            color: 0x151f34, metalness: 0.9, roughness: 0.3,
            clearcoat: 0.85, clearcoatRoughness: 0.22, envMapIntensity: 1.25,
        });
        const glowMat = new THREE.MeshStandardMaterial({
            color: 0x0a1633, emissive: 0x3b8cff, emissiveIntensity: 2.3,
            metalness: 0.3, roughness: 0.4,
        });
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xbfe0ff });
        const haloMat = new THREE.MeshBasicMaterial({
            color: 0x3b8cff, transparent: true, opacity: 0.32,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        materials.push(carbonMat, plateMat, glowMat, coreMat, haloMat);

        // --- Placement helpers ------------------------------------------------
        const vec = (k) => new THREE.Vector3(...JOINTS[k]);
        const segLen = (a, b) => vec(a).distanceTo(vec(b));
        const placeAlong = (mesh, a, b, axis, t = 0.5) => {
            const s = vec(a);
            const e = vec(b);
            const dir = new THREE.Vector3().subVectors(e, s).normalize();
            mesh.position.copy(s).lerp(e, t);
            mesh.quaternion.setFromUnitVectors(axis, dir);
        };

        // --- Limbs ------------------------------------------------------------
        LIMBS.forEach(([a, b, r, hasPlate, hasCollar]) => {
            const len = segLen(a, b);

            const coreGeo = track(new THREE.CapsuleGeometry(r, Math.max(len - r * 2, 0.02), 6, 16));
            const core = new THREE.Mesh(coreGeo, carbonMat);
            placeAlong(core, a, b, AXIS_Y);
            figure.add(core);

            if (hasPlate) {
                const plateGeo = track(new RoundedBoxGeometry(r * 3.1, len * 0.62, r * 3.1, 3, r * 0.9));
                const plate = new THREE.Mesh(plateGeo, plateMat);
                placeAlong(plate, a, b, AXIS_Y);
                figure.add(plate);
            }

            if (hasCollar) {
                const collarGeo = track(new THREE.TorusGeometry(r * 1.45, r * 0.3, 8, 22));
                const collar = new THREE.Mesh(collarGeo, glowMat);
                placeAlong(collar, a, b, AXIS_Z, 0.55);
                figure.add(collar);
            }
        });

        // --- Torso: stacked armor plates along the spine ----------------------
        const torsoPlates = [
            { y: 0.42, z: -0.01, w: 0.34, h: 0.24, d: 0.22 }, // pelvis
            { y: 0.66, z: 0.01, w: 0.30, h: 0.24, d: 0.19 },  // abdomen
            { y: 0.90, z: 0.02, w: 0.42, h: 0.30, d: 0.21 },  // chest
        ];
        torsoPlates.forEach(({ y, z, w, h, d }) => {
            const g = track(new RoundedBoxGeometry(w, h, d, 4, 0.05));
            const m = new THREE.Mesh(g, plateMat);
            m.position.set(0, y, z);
            figure.add(m);
        });

        // Chest reactor core (arc-reactor style, faces front)
        const reactorRing = new THREE.Mesh(track(new THREE.TorusGeometry(0.055, 0.016, 10, 26)), glowMat);
        reactorRing.position.set(0, 0.94, 0.13);
        figure.add(reactorRing);
        const reactorCore = new THREE.Mesh(track(new THREE.SphereGeometry(0.03, 16, 16)), coreMat);
        reactorCore.position.set(0, 0.94, 0.13);
        figure.add(reactorCore);
        const reactorHalo = new THREE.Mesh(track(new THREE.SphereGeometry(0.075, 16, 16)), haloMat);
        reactorHalo.position.set(0, 0.94, 0.14);
        figure.add(reactorHalo);

        // --- Neck + head ------------------------------------------------------
        const shoulderMid = vec('left_shoulder').add(vec('right_shoulder')).multiplyScalar(0.5);
        const headCenter = new THREE.Vector3(0, 1.30, 0.05);

        const neckDir = new THREE.Vector3().subVectors(headCenter, shoulderMid);
        const neckGeo = track(new THREE.CapsuleGeometry(0.05, Math.max(neckDir.length() - 0.12, 0.02), 6, 14));
        const neck = new THREE.Mesh(neckGeo, carbonMat);
        neck.position.copy(shoulderMid).add(headCenter).multiplyScalar(0.5);
        neck.quaternion.setFromUnitVectors(AXIS_Y, neckDir.clone().normalize());
        figure.add(neck);

        const headGeo = track(new RoundedBoxGeometry(0.19, 0.24, 0.21, 5, 0.07));
        const head = new THREE.Mesh(headGeo, plateMat);
        head.position.copy(headCenter);
        figure.add(head);

        // Glowing visor across the eye line
        const visor = new THREE.Mesh(track(new THREE.BoxGeometry(0.16, 0.035, 0.02)), glowMat);
        visor.position.set(0, 1.31, 0.145);
        figure.add(visor);

        // --- Joints: dark ball + glowing energy core + halo -------------------
        const ballGeo = track(new THREE.SphereGeometry(0.05, 18, 18));
        const jointCoreGeo = track(new THREE.SphereGeometry(0.03, 14, 14));
        const jointHaloGeo = track(new THREE.SphereGeometry(0.085, 16, 16));
        const faceCoreGeo = track(new THREE.SphereGeometry(0.014, 10, 10));

        MAJOR_JOINTS.forEach((k) => {
            const p = JOINTS[k];
            const ball = new THREE.Mesh(ballGeo, carbonMat);
            ball.position.set(...p);
            figure.add(ball);
            const c = new THREE.Mesh(jointCoreGeo, glowMat);
            c.position.set(...p);
            figure.add(c);
            const h = new THREE.Mesh(jointHaloGeo, haloMat);
            h.position.set(...p);
            figure.add(h);
        });
        // Face keypoints → small sensor dots on the head
        FACE_KEYS.forEach((k) => {
            const dot = new THREE.Mesh(faceCoreGeo, coreMat);
            dot.position.set(...JOINTS[k]);
            figure.add(dot);
        });

        // --- Hands / feet caps so limbs don't end abruptly --------------------
        const capGeo = track(new RoundedBoxGeometry(0.075, 0.06, 0.09, 3, 0.025));
        ['left_wrist', 'right_wrist', 'left_ankle', 'right_ankle'].forEach((k) => {
            const cap = new THREE.Mesh(capGeo, carbonMat);
            cap.position.set(...JOINTS[k]);
            figure.add(cap);
        });

        // --- Ground: glowing meditation ring ----------------------------------
        const ring = new THREE.Mesh(
            track(new THREE.TorusGeometry(0.78, 0.02, 12, 80)),
            glowMat
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.01;
        figure.add(ring);
        const ringGlow = new THREE.Mesh(
            track(new THREE.RingGeometry(0.7, 0.86, 64)),
            haloMat
        );
        ringGlow.rotation.x = -Math.PI / 2;
        ringGlow.position.y = 0.005;
        figure.add(ringGlow);

        // --- Ambient particles ------------------------------------------------
        const COUNT = 240;
        const pPos = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i += 1) {
            pPos[i * 3] = (Math.random() - 0.5) * 6;
            pPos[i * 3 + 1] = Math.random() * 3;
            pPos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 0.5;
        }
        const pGeo = track(new THREE.BufferGeometry());
        pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0x8ec2ff, size: 0.02, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        materials.push(particleMat);
        const particles = new THREE.Points(pGeo, particleMat);
        scene.add(particles);

        // --- Animation --------------------------------------------------------
        let frameId;
        const clock = new THREE.Clock();

        const render = () => {
            const t = clock.getElapsedTime();
            if (!reduceMotion) {
                figure.rotation.y = Math.sin(t * 0.22) * 0.5;
                figure.position.y = Math.sin(t * 0.7) * 0.02;      // slow breath
                const pulse = 2.0 + Math.sin(t * 1.5) * 0.6;
                glowMat.emissiveIntensity = pulse;
                haloMat.opacity = 0.28 + Math.sin(t * 1.5) * 0.1;
                particles.rotation.y = t * 0.025;
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
            envRT?.dispose();
            pmrem?.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className={className} aria-hidden="true" />;
}
