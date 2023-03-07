import * as THREE from "three";
import {au, degToRad, metersToUnits, minEntityRadius} from "./Math";
import {CelestialBody} from "./SolarSystem";

export default class Entity
{
    type: CelestialBody;
    name: string;
    diameter: number;
    albedo: number; 
    eccentricity: number;
    semimajor_axis: number;
    perihelion: number; 
    inclination: number;
    asc_node_long: number;
    arg_periapsis: number;
    mean_anomaly: number;
    true_anomaly: number;
    classid: number;

    entityBody: THREE.Mesh;
    entityOrbit: THREE.Line;

    constructor(type: CelestialBody, name: string, diameter: number, albedo: number, 
        eccentricity: number, semimajor_axis: number, perihelion: number, 
        inclination: number, asc_node_long: number, arg_periapsis: number, 
        mean_anomaly: number, true_anomaly: number, classid: number)
    {
        this.type = type;
        this.name = name;
        this.diameter = diameter;
        this.albedo = albedo;
        this.eccentricity = eccentricity;
        this.semimajor_axis = semimajor_axis;
        this.perihelion = perihelion;
        this.inclination = inclination;
        this.asc_node_long = asc_node_long;
        this.arg_periapsis = arg_periapsis;
        this.mean_anomaly = mean_anomaly;
        this.true_anomaly = true_anomaly;
        this.classid = classid;


			// math
        let semiMinorAxis = (semimajor_axis * Math.sqrt(1-eccentricity**2))
        let semiLatusRectum = semimajor_axis * (1-eccentricity**2)
        let focusDistance = eccentricity*semimajor_axis
        // console.log(`${name}, b:${semiMinorAxis}, focus:${focusDistance}`);

        // create orbit shape
        let orbitEllipse = new THREE.EllipseCurve(
            focusDistance, 0, // ax, aY
            semimajor_axis, semiMinorAxis,// semiminor axis, semimajor axis
            0.1, 2 * Math.PI - 0.1,  // aStartAngle, aEndAngle
            false, // aClockwise
            degToRad(0) // aRotation
        );
        // create ellipse with a good amount of points/resolution
        let points = orbitEllipse.getPoints(Math.max(64, Math.round(2000*eccentricity)));

        // create the actual orbit line 3D object
        let orbitColor = (type == CelestialBody.Planet) ? 0x00ff00 : 0xff00ff;
        let orbitLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({color:orbitColor, opacity:1}));

        orbitLine.rotateY(degToRad(asc_node_long)) // rotate along reference plane for long of ascending node 
        orbitLine.rotateX(degToRad(inclination+90)) //rotate along reference plane for inclination
        orbitLine.name = `${name}'s Orbit`

        this.entityOrbit = orbitLine

        // create the planet 3D object
        let visualRadius = Math.max(metersToUnits(diameter/2), minEntityRadius*4)
        let geometry = (type == CelestialBody.Planet) ? new THREE.SphereGeometry(visualRadius, 64, 32) : new THREE.IcosahedronGeometry(visualRadius, 1);
        let bodyColor = (type == CelestialBody.Planet) ? 0x00ffff : 0x0000ff;
        let material = new THREE.MeshBasicMaterial({color: bodyColor});
        let mesh = new THREE.Mesh(geometry, material);
        mesh.name = `${name}`
        mesh.position.add(new THREE.Vector3(metersToUnits((focusDistance+semimajor_axis)*au), 0, 0))
        this.entityBody = mesh;
    }
}
