import React from 'react';
import { css, cx, useViewport } from '@nocobase/client';
import { ClockIn } from './clockIn';

const commonCSSVariables = css`
  --nb-spacing: 14px;
`;
const commonCSSOverride = css``;
const commonDesignerCSS = css`
  --nb-designer-top: 2px;
  --nb-designer-right: 2px;
  .nb-sortable-designer:hover {
    position: relative;
    > .general-schema-designer {
      display: block;
    }
  }
  .general-schema-designer {
    position: absolute;
    z-index: 999;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: none;
    border: 0;
    pointer-events: none;
    > .general-schema-designer-icons {
      position: absolute;
      top: var(--nb-designer-top);
      right: var(--nb-designer-right);
      line-height: 16px;
      pointer-events: all;
      .ant-space-item {
        background-color: var(--colorSettings);
        color: #fff;
        line-height: 16px;
        width: 16px;
        padding-left: 1px;
        align-self: stretch;
      }
    }
  }
`;

export const Clock = () => {
  useViewport();
  return (
    <div
      className={cx(
        'nb-mobile-application',
        commonDesignerCSS,
        commonCSSVariables,
        commonCSSOverride,
        css`
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          padding: 20px;
        `,
      )}
    >
      <ClockIn></ClockIn>
    </div>
  );
};
