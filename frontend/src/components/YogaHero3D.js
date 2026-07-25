import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * WebGL hero: a stylized futuristic woman seated in a lotus / meditation pose,
 * gently breathing and rocking. The body is built around the same 17 keypoints
 * MoveNet tracks in the live session, sculpted into a feminine figure — curvy
 * torso, slim limbs, a glowing bodysuit and hair in a bun.
 */

// Seated lotus pose (y-up, ground at y = 0), tuned to feminine proportions.
const JOINTS = {
    nose: [0, 1.29, 0.10],
    left_eye: [-0.038, 1.31, 0.125],
    right_eye: [0.038, 1.31, 0.125],
    left_ear: [-0.088, 1.29, 0.03],
    right_ear: [0.088, 1.29, 0.03],
    left_shoulder: [-0.19, 1.00, 0],
    right_shoulder: [0.19, 1.00, 0],
    left_elbow: [-0.29, 0.72, 0.06],
    right_elbow: [0.29, 0.72, 0.06],
    left_wrist: [-0.40, 0.36, 0.17],
    right_wrist: [0.40, 0.36, 0.17],
    left_hip: [-0.18, 0.32, -0.02],
    right_hip: [0.18, 0.32, -0.02],
    left_knee: [-0.42, 0.13, 0.16],
    left_ankle: [0.06, 0.22, 0.28],
    right_knee: [0.42, 0.13, 0.16],
    right_ankle: [-0.06, 0.26, 0.32],
};

// [a, b, radius, material] — arms bare (skin), legs in the suit.
const LIMBS = [
    ['left_shoulder', 'left_elbow', 0.042, 'skin'],
    ['left_elbow', 'left_wrist', 0.034, 'skin'],
    ['right_shoulder', 'right_elbow', 0.042, 'skin'],
    ['right_elbow', 'right_wrist', 0.034, 'skin'],
    ['left_hip', 'left_knee', 0.078, 'suit'],
    ['left_knee', 'left_ankle', 0.052, 'suit'],
    ['right_hip', 'right_knee', 0.078, 'suit'],
    ['right_knee', 'right_ankle', 0.052, 'suit'],
];

const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

// Feminine torso silhouette (radius, height) — hips → waist → bust → neck.
const TORSO_PROFILE = [
    [0.02, 0.30], [0.17, 0.33], [0.185, 0.37], [0.15, 0.46],
    [0.122, 0.56], [0.116, 0.60], [0.135, 0.70], [0.165, 0.86],
    [0.152, 0.92], [0.118, 0.99], [0.072, 1.03], [0.05, 1.06],
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
            return undefined; // WebGL unavailable — CSS fallback stays visible
        }

        const width = mount.clientWidth || 600;
        const height = mount.clientHeight || 600;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
        camera.position.set(0, 0.92, 3.5);
        camera.lookAt(0, 0.6, 0);

        // --- Soft studio reflections -----------------------------------------
        let pmrem;
        let envRT;
        try {
            pmrem = new THREE.PMREMGenerator(renderer);
            envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
            scene.environment = envRT.texture;
        } catch { /* reflections optional */ }

        // --- Flattering lighting: warm key, cool rim, soft fill --------------
        const ambient = new THREE.AmbientLight(0x415068, 0.8);
        const keyLight = new THREE.DirectionalLight(0xffe9d5, 1.35);
        keyLight.position.set(2.5, 3.2, 2.6);
        const rimLight = new THREE.DirectionalLight(0x3b8cff, 1.3);
        rimLight.position.set(-3, 1.6, -2.2);
        const fillLight = new THREE.PointLight(0x9fb8e0, 0.5, 10);
        fillLight.position.set(0, 1.0, 2.6);
        scene.add(ambient, keyLight, rimLight, fillLight);

        const figure = new THREE.Group();
        scene.add(figure);

        const geometries = [];
        const materials = [];
        const track = (g) => { geometries.push(g); return g; };

        // --- Materials --------------------------------------------------------
        const skinMat = new THREE.MeshStandardMaterial({
            color: 0xf0c6a0, roughness: 0.62, metalness: 0.0, envMapIntensity: 0.35,
        });
        const suitMat = new THREE.MeshPhysicalMaterial({
            color: 0x223a63, roughness: 0.42, metalness: 0.35,
            clearcoat: 0.5, clearcoatRoughness: 0.35, envMapIntensity: 0.9,
        });
        const hairMat = new THREE.MeshStandardMaterial({
            color: 0x241a2b, roughness: 0.5, metalness: 0.12, envMapIntensity: 0.5,
        });
        const browMat = new THREE.MeshStandardMaterial({ color: 0x3a2a22, roughness: 0.7 });
        const seamMat = new THREE.MeshStandardMaterial({
            color: 0x0a1633, emissive: 0x49b0ff, emissiveIntensity: 2.0, roughness: 0.4,
        });
        const haloMat = new THREE.MeshBasicMaterial({
            color: 0x3b8cff, transparent: true, opacity: 0.3,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        const matFor = (name) => (name === 'skin' ? skinMat : suitMat);
        materials.push(skinMat, suitMat, hairMat, browMat, seamMat, haloMat);

        // --- Helpers ----------------------------------------------------------
        const vec = (k) => new THREE.Vector3(...JOINTS[k]);
        const segLen = (a, b) => vec(a).distanceTo(vec(b));
        const placeAlong = (mesh, a, b, axis, t = 0.5) => {
            const s = vec(a);
            const e = vec(b);
            const dir = new THREE.Vector3().subVectors(e, s).normalize();
            mesh.position.copy(s).lerp(e, t);
            mesh.quaternion.setFromUnitVectors(axis, dir);
        };
        const ball = (r, mat, pos, scale) => {
            const m = new THREE.Mesh(track(new THREE.SphereGeometry(r, 20, 18)), mat);
            m.position.set(...pos);
            if (scale) m.scale.set(...scale);
            figure.add(m);
            return m;
        };

        // --- Torso: revolved feminine silhouette, flattened front-to-back ----
        const profilePts = TORSO_PROFILE.map(([r, y]) => new THREE.Vector2(r, y));
        const torsoGeo = track(new THREE.LatheGeometry(profilePts, 36));
        const torso = new THREE.Mesh(torsoGeo, suitMat);
        torso.scale.set(1, 1, 0.72);
        figure.add(torso);

        // Subtle bust + hip volume to read clearly feminine
        ball(0.052, suitMat, [-0.058, 0.87, 0.085], [1, 1, 0.85]);
        ball(0.052, suitMat, [0.058, 0.87, 0.085], [1, 1, 0.85]);
        ball(0.085, suitMat, [-0.15, 0.34, -0.01], [1.1, 0.9, 0.9]);
        ball(0.085, suitMat, [0.15, 0.34, -0.01], [1.1, 0.9, 0.9]);
        // Shoulder caps
        ball(0.05, suitMat, JOINTS.left_shoulder);
        ball(0.05, suitMat, JOINTS.right_shoulder);

        // Glowing suit accents (neckline + waist belt)
        const neckline = new THREE.Mesh(track(new THREE.TorusGeometry(0.072, 0.009, 8, 34)), seamMat);
        neckline.rotation.x = Math.PI / 2;
        neckline.position.set(0, 1.0, 0.02);
        neckline.scale.set(1, 0.75, 1);
        figure.add(neckline);
        const belt = new THREE.Mesh(track(new THREE.TorusGeometry(0.122, 0.011, 8, 42)), seamMat);
        belt.rotation.x = Math.PI / 2;
        belt.position.set(0, 0.585, 0);
        belt.scale.set(1, 0.72, 1);
        figure.add(belt);

        // --- Limbs (smooth capsules) + blend spheres at joints ----------------
        LIMBS.forEach(([a, b, r, mat]) => {
            const len = segLen(a, b);
            const geo = track(new THREE.CapsuleGeometry(r, Math.max(len - r * 2, 0.02), 6, 16));
            const m = new THREE.Mesh(geo, matFor(mat));
            placeAlong(m, a, b, AXIS_Y);
            figure.add(m);
        });
        // Joint blends
        ball(0.04, skinMat, JOINTS.left_elbow);
        ball(0.04, skinMat, JOINTS.right_elbow);
        ball(0.062, suitMat, JOINTS.left_knee);
        ball(0.062, suitMat, JOINTS.right_knee);
        // Hands resting on knees, bare feet
        ball(0.042, skinMat, JOINTS.left_wrist, [1.1, 0.8, 1.2]);
        ball(0.042, skinMat, JOINTS.right_wrist, [1.1, 0.8, 1.2]);
        ball(0.05, skinMat, JOINTS.left_ankle, [1, 0.75, 1.2]);
        ball(0.05, skinMat, JOINTS.right_ankle, [1, 0.75, 1.2]);

        // Glowing knee rings
        [['left_knee', 'left_ankle'], ['right_knee', 'right_ankle']].forEach(([a, b]) => {
            const ring = new THREE.Mesh(track(new THREE.TorusGeometry(0.06, 0.008, 8, 24)), seamMat);
            placeAlong(ring, a, b, AXIS_Z, 0.06);
            figure.add(ring);
        });

        // --- Neck + head ------------------------------------------------------
        const shoulderMid = vec('left_shoulder').add(vec('right_shoulder')).multiplyScalar(0.5);
        const headCenter = new THREE.Vector3(0, 1.30, 0.05);
        const neckTop = new THREE.Vector3(0, 1.19, 0.04);

        const neckDir = new THREE.Vector3().subVectors(neckTop, shoulderMid);
        const neckGeo = track(new THREE.CapsuleGeometry(0.036, Math.max(neckDir.length() - 0.07, 0.02), 6, 14));
        const neck = new THREE.Mesh(neckGeo, skinMat);
        neck.position.copy(shoulderMid).add(neckTop).multiplyScalar(0.5);
        neck.quaternion.setFromUnitVectors(AXIS_Y, neckDir.clone().normalize());
        figure.add(neck);

        // Face (serene, slightly tapered chin)
        ball(0.104, skinMat, headCenter.toArray(), [0.86, 1.02, 0.92]);
        // Closed-eye hints reuse the eye keypoints
        [JOINTS.left_eye, JOINTS.right_eye].forEach((p) => {
            const eye = new THREE.Mesh(track(new THREE.SphereGeometry(0.014, 10, 8)), browMat);
            eye.position.set(p[0], p[1] - 0.005, p[2] - 0.01);
            eye.scale.set(1.4, 0.4, 0.6);
            figure.add(eye);
        });

        // Hair: pulled-back cap + top bun, framing the face
        ball(0.118, hairMat, [0, 1.322, -0.028], [0.98, 1.0, 1.02]);
        ball(0.058, hairMat, [0, 1.40, -0.085]); // bun
        ball(0.02, seamMat, [0, 1.40, -0.085], [1.6, 1.6, 1.6]); // faint glow tie

        // --- Ground meditation ring ------------------------------------------
        const ring = new THREE.Mesh(track(new THREE.TorusGeometry(0.78, 0.018, 12, 80)), seamMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.01;
        figure.add(ring);
        const ringGlow = new THREE.Mesh(track(new THREE.RingGeometry(0.7, 0.88, 64)), haloMat);
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
                figure.position.y = Math.sin(t * 0.7) * 0.018;      // slow breath
                seamMat.emissiveIntensity = 1.7 + Math.sin(t * 1.5) * 0.5;
                haloMat.opacity = 0.26 + Math.sin(t * 1.5) * 0.09;
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
