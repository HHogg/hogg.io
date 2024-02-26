import type { ClientRectObject, VirtualElement } from '@floating-ui/react';
import { usePlacementContext } from 'preshape';
import { useEffect } from 'react';

class Reference implements VirtualElement {
  rect: ClientRectObject;

  constructor(rect: ClientRectObject) {
    this.rect = rect;
  }

  get clientHeight() {
    return this.rect.height;
  }

  get clientWidth() {
    return this.rect.width;
  }

  getBoundingClientRect(): ClientRectObject {
    return this.rect;
  }
}

export default function EditorToolbarReference({
  rect,
}: {
  rect: ClientRectObject | null;
}) {
  const {
    context: {
      refs: { setReference },
    },
  } = usePlacementContext();

  useEffect(() => {
    if (rect) {
      setReference(new Reference(rect));
    }
  }, [rect, setReference]);

  return null;
}
