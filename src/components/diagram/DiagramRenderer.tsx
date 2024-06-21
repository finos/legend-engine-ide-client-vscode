/**
 * Copyright (c) 2023-present, Goldman Sachs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  type Diagram,
  getPureGraph,
  getDiagram,
  DiagramRenderer,
} from '@finos/legend-vscode-extension-dependencies';
import { createRef, useEffect, useState } from 'react';
import '../../../style/index.scss';
import type { LegendEntity } from '../../model/LegendEntity';
import { postMessage } from '../../utils/VsCodeUtils';
import {
  GET_PROJECT_ENTITIES,
  GET_PROJECT_ENTITIES_RESPONSE,
} from '../../utils/Const';

export const DiagramRendererComponent: React.FC<{ diagramId: string }> = ({
  diagramId,
}) => {
  const ref = createRef<HTMLDivElement>();
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [entities, setEntities] = useState<LegendEntity[]>([]);
  const [error, setError] = useState<string | null>();

  useEffect(() => {
    postMessage({
      command: GET_PROJECT_ENTITIES,
    });
  }, [diagramId]);

  window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command === GET_PROJECT_ENTITIES_RESPONSE) {
      const es: LegendEntity[] = message.result;
      setEntities(es);
    }
  });

  useEffect(() => {
    if (entities.length && diagramId) {
      getPureGraph(entities)
        .then((pureModel) => {
          setDiagram(getDiagram(diagramId, pureModel));
          setError(null);
        })
        .catch((error) => {
          setError(error.message);
          setDiagram(null);
        });
    }
  }, [entities, diagramId]);

  useEffect(() => {
    if (diagram) {
      const diagramRenderer = new DiagramRenderer(
        ref.current as HTMLDivElement,
        diagram,
      );
      diagramRenderer.render({ initial: true });
    }
  }, [ref, diagram]);

  return (
    <div className="diagram__renderer" ref={ref}>
      {error ? (
        <div className="diagram__renderer__error">
          <span>Something went wrong. Diagram cannot be created.</span>
          <span
            className="diagram__renderer__error__details"
            title={`${error}`}
          >
            Error Details.
          </span>
        </div>
      ) : null}
    </div>
  );
};
