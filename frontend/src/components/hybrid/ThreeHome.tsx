import {OrbitControls, PerspectiveCamera} from "@react-three/drei";
import {Canvas, ThreeElements, useFrame} from "@react-three/fiber";
import {useEffect, useRef, useState} from "react";
import {Mesh, Vector3} from "three";
import {solarSystemPlanetData} from "./Planets";
import Entity from "./Entity";
import {CelestialBody} from "./SolarSystem";

// https://codesandbox.io/s/qxjoj?file=/src/App.js
export function ThreeHome() {
	const [gridActive, setGridActive] = useState(true);
	const [axesActive, setAxesActive] = useState(true);

	const [scale, setScale] = useState(1.0);

	return (
		<>
			<Canvas shadows={false}>
				<SolarSystem axesChecked={axesActive} gridChecked={gridActive} scale={scale}/>
			</Canvas>
			<InfoView setScale={setScale}/>
		</>
	);
}

export type SolarSystemProp = {
	axesChecked: boolean,
	gridChecked: boolean,
	scale: number,
}

export function SolarSystem({axesChecked, gridChecked, scale}: SolarSystemProp) {

	const [asteroids, setAsteroids] = useState([]);
	const [planets, setPlanets] = useState<Entity[]>([]);

	useEffect(() => {
		console.log("Creating solar system in useEffect");
		let ss = solarSystemPlanetData;
		for (let [planetName, attributes] of Object.entries(ss)) {
			let thisType = (planetName === 'sample') ? CelestialBody.Asteroid : CelestialBody.Planet;
			let newPlanetObject = new Entity(
				thisType,
				attributes.name,
				attributes.diameter, attributes.albedo,
				attributes.eccentricity,
				attributes.semimajor_axis,
				attributes.perihelion,
				attributes.inclination,
				attributes.asc_node_long,
				attributes.arg_periapsis,
				attributes.mean_anomaly,
				attributes.true_anomaly,
				attributes.classid);
			if (thisType == CelestialBody.Planet) { // @ts-ignore
				console.log("Adding planet");
				setPlanets(planets => [...planets, newPlanetObject]);
			} else { // @ts-ignore
				setAsteroids(asteroids => [...asteroids, newPlanetObject]);
			}
		}
	}, []);

	// EntityComponent's `position` property is provided by react-three-fiber and newScale is ours
	return (
		<>
			<ambientLight intensity={0.1}/>
			{planets == null ? null :
				planets.map((ety) => {
					return <EntityComponent newScale={scale} position={ety.entityBody.position}/>
				})
			}
			<Axes isVisible={axesChecked}/>
			<Grid isVisible={gridChecked}/>
			<PerspectiveCamera fov={40} aspect={16 / 9} near={0.1} far={10000} position={new Vector3(1, 2, 3)}/>
			<OrbitControls makeDefault enableDamping={false}/>
		</>
	)
}

export function InfoView(props: any) {
	const {setScale} = props;
	const currentScale = useState(1.0);

	function handleSubmit(event: any) {
		setScale(currentScale);
		event.preventDefault();
	}

	return (
		<div id="info-viewer">
			<form onSubmit={handleSubmit}>
				<label>
					Scale:
					<input type="text" name="scale" onChange={e => setScale(e.target.value)}/>
				</label>
				<input type="submit" value="Set New Scale"/>
			</form>
		</div>
	)
}


type EntityProps = ThreeElements['mesh'] & {
	newScale: number,
}

function EntityComponent(props: EntityProps) {
	// This reference will give us direct access to the mesh
	const mesh = useRef<Mesh>(null!);

	let {newScale} = props;
	console.log(newScale);
	return (
		<mesh
			{...props}
			ref={mesh}
			scale={newScale}
		>
			<sphereGeometry args={[1, 32, 16]}/>
			<meshStandardMaterial color={0xffffff}/>
		</mesh>
	)
}

function Box(props: ThreeElements['mesh']) {
	// This reference will give us direct access to the mesh
	const mesh = useRef<Mesh>(null!)

	// Set up state for the hovered and active state
	const [hovered, setHover] = useState(false)
	const [active, setActive] = useState(false)
	// Subscribe this component to the render-loop, rotate the mesh every frame
	useFrame((state, delta) => (mesh.current.rotation.x += delta))
	// Return view, these are regular three.js elements expressed in JSX
	return (
		<mesh
			{...props}
			ref={mesh}
			scale={active ? 1.5 : 1}
			onClick={(event) => setActive(!active)}
			onPointerOver={(event) => setHover(true)}
			onPointerOut={(event) => setHover(false)}>
			<boxGeometry args={[1, 1, 1]}/>
			<meshStandardMaterial color={hovered ? 0xffffff : 0xffff00}/>
		</mesh>
	)
}

type AxesProp = { isVisible: boolean }

function Axes({isVisible}: AxesProp) {
	// args = [scale]
	return (
		<axesHelper args={[50]} visible={isVisible}/>
	)
}

type GridProp = { isVisible: boolean }

function Grid({isVisible}: GridProp) {
	// args = [x-y length, num divisions]
	return (
		<gridHelper args={[100, 100]} visible={isVisible}/>
	)
}

export function SidePanel() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<div className="side-window" style={{display: isOpen ? "block" : "none", right: 0}} id="rightMenu">
				<button onClick={() => setIsOpen(current => !current)}
								className="transition-button full-width">Close &times;</button>
				<div id="entity-list">
					<div className="entity-list-item">
						<input type="checkbox" id="sun-toggle" name="sun-toggle" checked/>
						<label htmlFor="sun-toggle">Sun</label>
					</div>
					<p>List of all planets and asteroids in window</p>
					<p>'Add' button to add asteroid from the database</p>
					<p>Link to go to different page to search for asteroids in DB</p>
				</div>
				<button onClick={() => console.log("DB")} className="transition-button full-width">Go to Database Search
				</button>
			</div>
			<button className="side-window-button transition-button" onClick={() => setIsOpen(current => !current)}>icon
			</button>
		</>
	)
}

export type WidgetButtonProp = {
	name: string,
	text: string,
	isChecked: boolean,
	onToggleClick: () => void,
}

export function WidgetButton({name, text, isChecked, onToggleClick}: WidgetButtonProp) {
	return (
		<div className="widget-item">
			<input type="checkbox" id={name} name={name} onClick={onToggleClick} checked={isChecked}/>
			<label htmlFor={name}>{text}</label>
		</div>
	)
}
