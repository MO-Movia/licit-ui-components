// @flow

import * as React from 'react';
import cx from 'classnames';
import './czi-custom-button.css';
import {PointerSurface} from './PointerSurface';
import {TooltipSurface} from './TooltipSurface';

import type { PointerSurfaceProps } from './PointerSurface';

class CustomButton extends React.PureComponent<any, any> {
  props: PointerSurfaceProps & {
    icon?: string | React.Element<any> | null,
    label?: string | React.Element<any> | null,
  };

  render(): React.Element<any> {
    const { icon, label, className, title, ...pointerProps } = this.props;
    const klass = cx(className, 'czi-custom-button', {
      'use-icon': !!icon,
    });
    return (
      <TooltipSurface tooltip={title}>
        <PointerSurface {...pointerProps} className={klass}>
          {icon}
          {label}
        </PointerSurface>
      </TooltipSurface>
    );
  }
}

export default CustomButton;
