import { ReferenceObject } from 'popper.js';
import {
  Button,
  Buttons,
  Icons,
  Placement,
  PlacementArrow,
  PlacementContent,
} from 'preshape';
import React, { useEffect, useState } from 'react';

interface Props {
  rect: DOMRect | null;
  onCopy: () => void;
  onDelete: () => void;
}

class Reference implements ReferenceObject {
  rect: DOMRect;

  constructor(rect: DOMRect) {
    this.rect = rect;
  }

  get clientHeight() {
    return this.rect.height;
  }

  get clientWidth() {
    return this.rect.width;
  }

  getBoundingClientRect(): DOMRect {
    return this.rect;
  }
}

export default function EditorToolbar({ rect, onCopy, onDelete }: Props) {
  const [referenceElement, setReferenceElement] = useState<Reference>();

  useEffect(() => {
    if (rect) {
      setReferenceElement(new Reference(rect));
    }
  }, [rect]);

  return (
    <Placement
      options={{ referenceElement }}
      placement="top"
      visible={!!rect}
      theme="night"
    >
      <PlacementArrow backgroundColor="background-shade-1" />
      <PlacementContent
        backgroundColor="background-shade-1"
        borderRadius="x2"
        padding="x1"
        textColor="text-shade-1"
      >
        <Buttons>
          <Button onClick={onCopy} variant="tertiary">
            <Icons.Copy size="1rem" />
          </Button>

          <Button onClick={onDelete} variant="tertiary">
            <Icons.Trash2 size="1rem" />
          </Button>
        </Buttons>
      </PlacementContent>
    </Placement>
  );
}
