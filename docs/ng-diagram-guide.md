# Guía de implementación de ng-diagram

Guía práctica para integrar [ng-diagram](https://www.ng-diagram.com/) en herramientas del catálogo Double Diamond. Cubre el setup, el patrón de nodo custom con edición inline, y **los dos bugs que nos quemaron en la primera integración** (conectar nodos y centrar el viewport).

Referencias vivas en el repo:

- `frontend/src/app/Pages/platform/phase-detail/tool-application-detail/tools/diagrama-sistema/` — primer caso.
- `frontend/src/app/Pages/platform/phase-detail/tool-application-detail/tools/in-out/` — segundo caso, mismo patrón.

---

## 1. Cuándo usar ng-diagram

Cualquier herramienta que necesite un canvas con nodos, puertos y edges: mapa de actores, diagrama de sistema, flujo in/out, journey, etc. Si la herramienta es una grilla de texto plano, no uses ng-diagram — se paga complejidad sin necesidad.

## 2. Setup

El paquete ya está en `frontend/package.json` y sus assets de fuentes/estilos registrados en `frontend/angular.json`. No hay nada más que instalar.

Imports que vas a usar desde `'ng-diagram'`:

```ts
import {
  Edge,
  EdgeDrawnEvent,
  NgDiagramBackgroundComponent,
  NgDiagramComponent,
  NgDiagramModelService,
  NgDiagramNodeTemplateMap,
  NgDiagramNodeTemplate,
  NgDiagramPortComponent,
  SelectionMovedEvent,
  SelectionRemovedEvent,
  SimpleNode,
  initializeModel,
  provideNgDiagram,
} from 'ng-diagram';
```

## 3. Esqueleto del componente host

Este es el componente que renderiza el `<ng-diagram>`. Lo típico: recibe la data persistida por `input()`, emite eventos hacia afuera (`edgeDrawn`, `nodeMoved`, `selectionRemoved`, etc.), y expone métodos imperativos para agregar nodos.

```ts
@Component({
  selector: 'app-foo-diagram',
  standalone: true,
  imports: [NgDiagramComponent, NgDiagramBackgroundComponent],
  providers: [provideNgDiagram(), FooNodeEditService],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="foo-diagram-wrap">
      <ng-diagram
        [model]="model"
        [config]="diagramConfig"
        [nodeTemplateMap]="nodeTemplateMap"
        (edgeDrawn)="onEdgeDrawn($event)"
        (selectionMoved)="onSelectionMoved($event)"
        (selectionRemoved)="onSelectionRemoved($event)"
      >
        <ng-diagram-background type="dots" />
      </ng-diagram>
    </div>
  `,
})
export class FooDiagramComponent {
  private readonly injector = inject(Injector);
  private readonly modelService = inject(NgDiagramModelService);

  model = initializeModel(undefined, this.injector);

  readonly diagramConfig = {
    zoom: {
      max: 1.5,
      zoomToFit: { padding: 40, onInit: true }, // ← fix bug 2
    },
  };

  readonly nodeTemplateMap: NgDiagramNodeTemplateMap =
    new NgDiagramNodeTemplateMap([['foo-node', FooNodeComponent]]);
}
```

**Tres puntos críticos que parecen decoración pero no lo son:**

1. `provideNgDiagram()` **debe ir en `providers:` del componente host**, no en `app.config.ts`. Cada diagrama es un scope propio.
2. `initializeModel(undefined, this.injector)` — siempre pasar el `injector`. El model lee del DI interno de ng-diagram.
3. `NgDiagramModelService` se inyecta en el mismo componente donde está `provideNgDiagram()`. Si lo inyectás en un padre, apunta a otro scope.

## 4. Template del nodo custom

Implementa la interfaz `NgDiagramNodeTemplate<TData>` y declara los puertos con `<ng-diagram-port>`:

```ts
@Component({
  selector: 'app-foo-node',
  standalone: true,
  imports: [NgDiagramPortComponent, FormsModule],
  template: `
    <div class="foo-node">
      <ng-diagram-port id="left" type="both" side="left" />

      <!-- contenido editable -->
      <input
        [ngModel]="nombre()"
        (ngModelChange)="onNombreChange($event)"
        data-no-drag="true"
        data-no-pan="true"
      />

      <ng-diagram-port id="right" type="both" side="right" />
    </div>
  `,
})
export class FooNodeComponent implements NgDiagramNodeTemplate<FooData> {
  node = input.required<SimpleNode<FooData>>();
  // ...
}
```

Las `id` de los puertos (`'left'`, `'right'`) son las que usás al construir edges (`sourcePort`, `targetPort`).

---

## 5. 🐛 Bug 1 — No se pueden conectar nodos que tienen inputs/selects/botones

### Síntoma

Arrastrás desde el puerto de salida, el cursor llega al otro nodo, pero al pasar por encima del `<input>` interno **el drag se cancela y no se dispara `edgeDrawn`**. A veces tampoco se puede ni arrancar el drag si el puerto queda cerca de un control.

### Causa

ng-diagram instala handlers globales de `pointerdown`/`pointermove` para gestionar drag de nodos, pan del canvas y dibujo de edges. Los elementos nativos interactivos (`input`, `select`, `button`, `textarea`) **también consumen** esos pointer events para lo suyo (focus, text selection, click). Gana el más cercano al target y el drag de ng-diagram muere en el camino.

### Fix

Marcar **cada control interactivo del nodo** con los data-attributes que ng-diagram respeta:

```html
<input data-no-drag="true" data-no-pan="true" ... />
<select data-no-drag="true" data-no-pan="true">...</select>
<button data-no-drag="true" data-no-pan="true">...</button>
```

Regla práctica: **si el usuario puede tipear, seleccionar o clickear dentro del nodo, ese elemento lleva los dos atributos.** Opcionalmente también el contenedor que los envuelve.

Referencia: `diagrama-sistema-node.component.ts:30-74` — todos los inputs, selects y el botón de eliminar llevan el par completo.

---

## 6. 🐛 Bug 2 — Los nodos abren fuera del viewport

### Síntoma

Se monta el diagrama y los nodos aparecen cortados arriba-izquierda, o directamente no se ven. Tenés que hacer zoom-out manual para encontrarlos.

### Causa

Sin configuración de zoom, ng-diagram arranca en `zoom: 1` con el viewport en `(0,0)`. Si tus nodos viven en coordenadas calculadas (por ejemplo, distribuidos en círculo a partir de `(300, 200)` con radio variable), fácilmente quedan fuera del área visible.

### Fix

```ts
readonly diagramConfig = {
  zoom: {
    max: 1.5,
    zoomToFit: {
      padding: 40,
      onInit: true,   // ← centra y ajusta zoom al montar
    },
  },
};
```

Complemento obligatorio: usar `autoSize: true` en cada `SimpleNode`. Sin esto, ng-diagram no conoce el bounding box real del nodo antes del primer render y el `zoomToFit` calcula mal.

```ts
const node: SimpleNode<FooData> = {
  id,
  type: 'foo-node',
  position: { x, y },
  autoSize: true, // ← sin esto, el fit es impreciso
  data: { ... },
};
```

---

## 7. Edición inline dentro del nodo — bus de eventos

Los nodos custom se instancian dinámicamente por ng-diagram, **no son hijos directos del host en el árbol de Angular**. Eso significa que:

- `@Output()` en el nodo **no llega** al host.
- `inject(HostComponent)` tampoco — no hay relación padre-hijo en el DI.

### Solución: servicio con `Subject`s provisto en el host

```ts
// foo-node-edit.service.ts
@Injectable()
export class FooNodeEditService {
  readonly nodeUpdated = new Subject<FooFieldUpdate>();
  readonly nodeDeleted = new Subject<string>();
}
```

El servicio va en `providers:` del componente host (junto a `provideNgDiagram()`). Como es el mismo scope que el `NgDiagramModelService`, los nodos lo reciben por `inject()`.

```ts
// En el host
constructor() {
  this.nodeEditService.nodeUpdated
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(update => this.nodeFieldUpdated.emit(update));

  this.nodeEditService.nodeDeleted
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(id => {
      this.modelService.deleteNodes([id]);
      this.nodeDeleteRequested.emit(id);
    });
}

// En el nodo
onNombreChange(value: string): void {
  this.editService.nodeUpdated.next({ id: this.node().id, field: 'nombre', value });
}
```

Ver `diagrama-node-edit.service.ts` + uso en `diagrama-sistema-diagram.component.ts:190-201`.

## 8. Mutar el modelo desde afuera

**Nunca reasignes `this.model`.** Una vez creado con `initializeModel`, modificalo vía `NgDiagramModelService`:

```ts
this.modelService.addNodes([node]);
this.modelService.deleteNodes([id]);
this.modelService.updateNodes([{ id, data: { ...newData } }]);
this.modelService.updateEdges([{ id, data: { color: 'red' } }]);
```

Para hidratación inicial (cuando el `input()` trae data persistida) sí podés usar `this.model.updateNodes(...)` una sola vez.

## 9. Hidratación inicial vs. runtime

Problema típico: el `input()` de data cambia por trivialidades (emisiones del padre) y rearmarías el modelo perdiendo posiciones que el usuario movió.

Patrón: poblar el modelo **una única vez** con `effect()` + flag:

```ts
private modelInitialized = false;

constructor() {
  effect(() => {
    const data = this.data();
    if (this.modelInitialized) return;
    this.model.updateNodes(this.buildNodes(data));
    this.model.updateEdges(this.buildEdges(data));
    this.modelInitialized = true;
  });
}
```

De ahí en adelante, toda adición/edición pasa por `modelService` + eventos emitidos hacia el padre que se encarga de persistir.

---

## 10. Checklist para una herramienta nueva con diagrama

1. Crear `foo-diagram.component.ts` con `provideNgDiagram()` + `FooNodeEditService` en `providers`.
2. Crear `foo-node.component.ts` implementando `NgDiagramNodeTemplate<FooData>`, con `<ng-diagram-port>` en `left` y `right`.
3. Agregar `data-no-drag="true" data-no-pan="true"` a **cada** input, select, textarea y button dentro del nodo.
4. Configurar `zoom.zoomToFit: { padding: 40, onInit: true }` en `diagramConfig`.
5. Usar `autoSize: true` en todos los `SimpleNode` que crees.
6. Crear `foo-node-edit.service.ts` con los `Subject`s que necesites; suscribirse en el host con `takeUntilDestroyed`.
7. Hidratar data inicial con `effect()` + flag; mutaciones posteriores por `NgDiagramModelService`.

Si seguís la lista, los dos bugs que nos costaron un día no te tocan. Si algo se comporta raro, el 90% de las veces es un control interactivo sin los `data-no-*` o un nodo sin `autoSize`.
