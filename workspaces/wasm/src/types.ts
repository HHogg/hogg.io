/*
 Generated by typeshare 1.9.2
*/

export type Sequence = [number, number, number, number, number, number, number, number, number, number, number, number];

export type NodeId = string;

export interface BucketEntry<TEntryValue> {
	point: number[];
	size: number;
	value: TEntryValue;
	counters: Record<string, number>;
}

export interface Bucket<TEntryValue> {
	entries: BucketEntry<TEntryValue>[];
}

export enum ResizeMethod {
	First = "First",
	Fixed = "Fixed",
	Maximum = "Maximum",
	Minimum = "Minimum",
}

export interface SpatialGridMap<TEntryValue> {
	/**
	 * Default of "2" as 2 * 2 * 64 = 256 bits or a 16x16 grid.
	 * The reason we start with 4 blocks as opposed to 1 block
	 * is to avoid the case of shifting a single block over the center
	 * of 4 blocks which would require some block splitting.
	 */
	blocks_dimension: number;
	/** Sorted set of all occupied locations in the grid. */
	locations: Location[];
	/** Resizing */
	resize_method: ResizeMethod;
	/** Bucket store. */
	store: Map<number[], Bucket<TEntryValue>>;
	/** The amount of space each bit represents in the grid. */
	spacing?: number;
}

export interface Error {
	tiling: string;
	reason: string;
	timestamp: string;
}

export interface InsightsPerLevel {
	level: number;
	duration: number;
	countNodes: number;
	countValidTilings: number;
	countTotalTilings: number;
	countValidHas0: number;
	countValidHas3: number;
	countValidHas4: number;
	countValidHas6: number;
	countValidHas8: number;
	countValidHas12: number;
}

export interface InsightsPerMinute {
	minute: string;
	level: number;
	countSessions: number;
	countNodes: number;
	countValidTilings: number;
	countTotalTilings: number;
}

export interface InsightsPerSession {
	sessionId: string;
	countNodes: number;
	countValidTilings: number;
	countTotalTilings: number;
}

export interface SysInfo {
	hostname: string;
	ipAddress: string;
	os: string;
	osVersion: string;
	cpu: string;
}

export interface Session {
	id: string;
	workerCount: number;
	sysInfo: SysInfo;
	timestampStart: string;
	timestampStop?: string;
}

export enum Shape {
	Skip = "Skip",
	Triangle = "Triangle",
	Square = "Square",
	Hexagon = "Hexagon",
	Octagon = "Octagon",
	Dodecagon = "Dodecagon",
}

export interface TilingsFacetsRequest {
	showNodes: Shape[];
	showUniform: string[];
}

export enum Direction {
	Ascending = "Ascending",
	Descending = "Descending",
}

export interface TilingsRequest {
	page: number;
	pageDirection: Direction;
	pageSize: number;
	search: string;
	showDistinct: boolean;
	showNodes: Shape[];
	showUniform: string[];
}

export interface ResponseMultiple<T> {
	page: number;
	pageSize: number;
	total: number;
	results: T[];
}

export interface FacetValue {
	name: string;
	disabled: boolean;
}

export interface Facet {
	key: string;
	values: FacetValue[];
}

export interface VisitRequest {
	path: string;
}

export interface VisitsFacetsRequest {
	showNodes: Shape[];
	showInvalidTilings: boolean;
	showValidTilings: boolean;
}

export interface VisitsFacet {
	key: string;
	values: string[];
}

export interface VisitsRequest {
	page: number;
	pageDirection: Direction;
	pageSize: number;
	search: string;
	showNodes: Shape[];
	showInvalidTilings: boolean;
	showValidTilings: boolean;
}

export interface Style {
	chevronSize?: number;
	fill?: string;
	lineDash?: number[];
	lineThickness?: number;
	pointRadius?: number;
	shadowColor?: string;
	shadowBlur?: number;
	strokeColor?: string;
	strokeWidth?: number;
	opacity?: number;
}

export enum ColorMode {
	Placement = "Placement",
	Stage = "Stage",
}

export enum ColorPalette {
	BlackAndWhite = "BlackAndWhite",
	None = "None",
	VaporWave = "VaporWave",
	VaporWaveRandom = "VaporWaveRandom",
}

export enum ScaleMode {
	Cover = "Cover",
	Contain = "Contain",
}

/**
 * The layers of the components in the canvas.
 * This order is used to determine the order in which the components are drawn.
 */
export enum Layer {
	ShapeFill = "ShapeFill",
	ShapeBorder = "ShapeBorder",
	ConvexHull = "ConvexHull",
	PlaneOutline = "PlaneOutline",
	Axis = "Axis",
	GridLineSegment = "GridLineSegment",
	GridPolygon = "GridPolygon",
	Transform = "Transform",
	TransformPoints = "TransformPoints",
	BoundingBoxes = "BoundingBoxes",
}

export interface Styles {
	axis?: Style;
	boundingBoxes?: Style;
	grid?: Style;
	planeOutline?: Style;
	shape?: Style;
	transformContinuous?: Style;
	transformEccentric?: Style;
	transformPoints?: Style;
}

export interface Options {
	autoRotate?: boolean;
	colorMode?: ColorMode;
	colorPalette?: ColorPalette;
	isValid?: boolean;
	maxStage?: number;
	padding?: number;
	scaleMode?: ScaleMode;
	showLayers?: Record<Layer, boolean>;
	showTransformIndex?: number;
	styles: Styles;
}

export interface Tree {
	id: NodeId;
	countTotalChildren?: number;
	countValidChildren?: number;
	children: Tree[];
}

export interface Visit {
	path: string;
}

export interface Event {
	key: string;
	counters: Map<string, number>;
	duration: number;
}

export interface Metrics {
	events: Event[];
	eventsPending: Record<string, Event>;
}

export interface Point {
	x: number;
	y: number;
	index: number;
}

export interface BBox {
	center: Point;
	width: number;
	height: number;
	rotation: number;
}

export interface LineSegment {
	start: Point;
	end: Point;
}

export enum Offset {
	Center = "Center",
}

export type Stage = 
	| { type: "Seed", index?: undefined }
	| { type: "Placement", index?: undefined }
	| { type: "Transform", index: {
	index: number;
	repetition_index: number;
}};

export interface Polygon {
	bbox: BBox;
	centroid: Point;
	index: number;
	lineSegments: LineSegment[];
	offset: Offset;
	points: Point[];
	shape: Shape;
	stage: Stage;
	stageIndex: number;
}

export interface Entry {
	point: Point;
	value: number;
	radians: number;
}

export interface PointSequence {
	sequence: Sequence;
	center: Point;
	size: number;
	entries: Entry[];
}

export interface Plane {
	polygons: SpatialGridMap<Polygon>;
	polygonsPlacement: SpatialGridMap<Polygon>;
	seedPolygon?: Polygon;
	repetitions: number;
	lineSegments: SpatialGridMap<LineSegment>;
	pointsCenter: SpatialGridMap<PointSequence>;
	pointsEnd: SpatialGridMap<PointSequence>;
	pointsMid: SpatialGridMap<PointSequence>;
	metrics: Metrics;
	stages: Stage[];
}

export type TilingError = 
	| { name: "Application", data: {
	reason: string;
}}
	| { name: "InvalidNotation", data: {
	notation: string;
	reason: string;
}}
	| { name: "InvalidOffset", data: {
	offset: string;
	reason: string;
}}
	| { name: "InvalidOperation", data: {
	operation: string;
	reason: string;
}}
	| { name: "InvalidOriginIndex", data: {
	origin_index: string;
	reason: string;
}}
	| { name: "InvalidOriginType", data: {
	origin_type: string;
	reason: string;
}}
	| { name: "InvalidShape", data: {
	shape: string;
	reason: string;
}}
	| { name: "InvalidShapeGroup", data: {
	group: string;
	reason: string;
}}
	| { name: "InvalidShapeInGroup", data: {
	shape: string;
	group: string;
	reason: string;
}}
	| { name: "InvalidState", data: {
	reason: string;
}}
	| { name: "InvalidTiling", data: Error }
	| { name: "InvalidTransform", data: {
	transform: string;
	reason: string;
}}
	| { name: "InvalidTransformValue", data: {
	value: string;
	reason: string;
}}
	| { name: "InvalidVertexType", data: {
	value: string;
}};

export interface Result {
	notation: string;
	expansionPhases: number;
	error?: TilingError;
	transformIndex: number;
	timestamp: string;
	metrics: Metrics;
	vertexTypes: string[];
	edgeTypes: string[];
	shapeTypes: string[];
}

export interface ApplicationError {
	tiling: string;
	reason: string;
}

export interface ConvexHull {
	points: Point[];
}

export interface Path {
	nodes: Node[];
}

export type Transform = 
	| { type: "continuous", content: TransformContinuous }
	| { type: "eccentric", content: TransformEccentric };

export interface Transforms {
	index: number;
	list: Transform[];
}

export interface Notation {
	path: Path;
	path_plane: Plane;
	transforms: Transforms;
}

export interface OriginIndex {
	value: number;
}

export interface Seed {
	shape: Shape;
	offset: Offset;
}

export enum Operation {
	Reflect = "Reflect",
	Rotate = "Rotate",
}

export interface TransformValue {
	increment: number;
	operation: Operation;
	seed: Seed;
	value: number;
}

export interface TransformContinuous {
	operation: Operation;
	value: TransformValue;
}

export enum OriginType {
	CenterPoint = "CenterPoint",
	MidPoint = "MidPoint",
	EndPoint = "EndPoint",
}

export interface TransformEccentric {
	operation: Operation;
	originType: OriginType;
	originIndex: OriginIndex;
}

export enum Flag {
	Overlaps = "Overlaps",
	Gaps = "Gaps",
	Expanded = "Expanded",
	VertexTypes = "VertexTypes",
}

export interface Tiling {
	notation: string;
	plane: Plane;
	result: Result;
	optionExpansionPhases: number;
	optionFirstTransform: boolean;
	optionLinkPaths: boolean;
	optionTypeAhead: boolean;
	optionValidations?: Flag[];
}

export interface DrawStateSnapshot {
	metrics: Metrics;
}

export interface WasmError {
	message: string;
}

export interface PlayerStateSnapshot {
	drawIndex: number;
	maxIndex: number;
	intervalMs: number;
	isLooping: boolean;
	isPlaying: boolean;
}

export interface RenderStateSnapshot {
	result: Result;
}

export enum Separator {
	Group = "Group",
	Shape = "Shape",
	Transform = "Transform",
}

export type ValidationError = 
	| { type: "Application", content: {
	reason: string;
}}
	| { type: "Expansion", content?: undefined }
	| { type: "Gaps", content?: undefined }
	| { type: "Overlaps", content?: undefined }
	| { type: "VertexType", content: {
	sequence: string;
}};

export type WasmWorkerEvent = 
	| { name: "draw", data: DrawStateSnapshot }
	| { name: "error", data: WasmError }
	| { name: "findPreviousTiling", data: string }
	| { name: "findNextTiling", data: string }
	| { name: "player", data: PlayerStateSnapshot }
	| { name: "render", data: RenderStateSnapshot };

