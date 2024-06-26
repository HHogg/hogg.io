/*
 Generated by typeshare 1.9.2
*/

export type NodeId = string;

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
	strokeColor?: string;
	strokeWidth?: number;
	opacity?: number;
}

export enum ColorMode {
	BlackAndWhite = "BlackAndWhite",
	None = "None",
	Validity = "Validity",
	VaporWave = "VaporWave",
	VaporWaveRandom = "VaporWaveRandom",
}

export enum ScaleMode {
	Fixed = "Fixed",
	WithinBounds = "WithinBounds",
}

export enum Annotation {
	AxisOrigin = "AxisOrigin",
	Transform = "Transform",
	VertexType = "VertexType",
}

export interface Styles {
	axis?: Style;
	debug?: Style;
	grid?: Style;
	shape?: Style;
	transformContinuous?: Style;
	transformEccentric?: Style;
	vertexType?: Style;
}

export interface Options {
	activeTransformIndex?: number;
	autoRotate?: boolean;
	colorMode?: ColorMode;
	fadeUnmatchedShapeTypes?: boolean;
	expansionPhases?: number;
	isValid?: boolean;
	maxStage?: number;
	padding?: number;
	scaleMode?: ScaleMode;
	scaleSize?: number;
	showAnnotations?: Record<Annotation, boolean>;
	showDebug?: boolean;
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

export interface ApplicationError {
	tiling: string;
	reason: string;
}

export interface Result {
	notation: string;
	uid: string;
	transformIndex: number;
	uniform: number;
	timestamp: string;
}

export interface Context {
	applicationErrors: ApplicationError[];
	countTotalTilings: number;
	validTilings: Result[];
}

export interface Point {
	x: number;
	y: number;
	vertex_type?: number;
}

export interface BBox {
	min: Point;
	max: Point;
}

export interface EdgeTypeStore {
	edgeTypes: string[];
}

export interface ShapeTypeStore {
	shapeTypes: string[];
}

export interface VertexTypeStore {
	vertexTypes: string[];
}

export interface Classifier {
	edgeTypeStore: EdgeTypeStore;
	shapeTypeStore: ShapeTypeStore;
	vertexTypeStore: VertexTypeStore;
}

export interface Plane {
	bbox: BBox;
	scale: number;
	stages: number;
	stageAddedPolygon: boolean;
	classifier: Classifier;
}

export interface LineSegment {
	p1: Point;
	p2: Point;
}

export enum Offset {
	Center = "Center",
}

export enum Phase {
	Seed = "Seed",
	Placement = "Placement",
	Transform = "Transform",
}

export interface Polygon {
	bbox: BBox;
	centroid: Point;
	line_segments: LineSegment[];
	notation_index: number;
	offset: Offset;
	phase: Phase;
	points: Point[];
	shape: Shape;
	shape_type?: number;
	stage_index: number;
}

export interface Notation {
	optionLinkPaths: boolean;
	optionTypeAhead: boolean;
	optionWithFirstTransform: boolean;
	path: string;
	transforms: string;
}

export interface OriginIndex {
	value: number;
}

/**  */
export interface Path {
	option_type_ahead: boolean;
	nodes: Node[];
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

/**  */
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

export type Transform = 
	| { type: "continuous", content: TransformContinuous }
	| { type: "eccentric", content: TransformEccentric };

export interface Transforms {
	path: Path;
	index: number;
	list: Transform[];
}

/**  */
export interface Tiling {
	optionExpansionPhases: number;
	optionLinkPaths: boolean;
	optionWithFirstTransform: boolean;
	optionTypeAhead: boolean;
	notation: Notation;
	plane: Plane;
	buildContext: Context;
	error: string;
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
	| { type: "Overlaps", content?: undefined };

export enum ValidationFlag {
	Overlaps = "Overlaps",
	Gaps = "Gaps",
	Expansion = "Expansion",
	VertexTypes = "VertexTypes",
	EdgeTypes = "EdgeTypes",
	ShapeTypes = "ShapeTypes",
}

