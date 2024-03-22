import React, { forwardRef, ReactNode, CSSProperties, HTMLAttributes } from "react";
import classNames from "classnames";

import { Handle } from "../items/handle/handle"
import { Remove } from "../items/remove/remove"

import styles from "./container.module.css";

export interface ContainerProps {
    children: ReactNode;
    columns?: number;
    label?: string;
    style?: CSSProperties;
    horizontal?: boolean;
    hover?: boolean;
    handleProps?: HTMLAttributes<any>;
    scrollable?: boolean;
    shadow?: boolean;
    placeholder?: boolean;
    unstyled?: boolean;
    onClick?(): void;
    onRemove?(): void;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
    (
        {
            children,
            columns = 1,
            handleProps,
            horizontal,
            hover,
            onClick,
            onRemove,
            label,
            placeholder,
            style,
            scrollable,
            shadow,
            unstyled,
            ...props
        }: ContainerProps,
        ref
    ) => {
        const Component = onClick ? 'button' : 'div'

        return (
            <Component
                {...props}
                // TODO: typeof onClick extends undefined ? React.Ref<HTMLButtonElement> : React.Ref<HTMLDivElement>
                ref={ref as unknown as any}
                style={
                    {
                        ...style,
                        "--columns": columns,
                    } as React.CSSProperties
                }
                className={classNames(
                    styles.Container,
                    unstyled && styles.unstyled,
                    horizontal && styles.horizontal,
                    hover && styles.hover,
                    placeholder && styles.placeholder,
                    scrollable && styles.scrollable,
                    shadow && styles.shadow
                )}
                onClick={onClick}
                tabIndex={onClick ? 0 : undefined}
            >
                {label ? (
                    <div className={styles.Header}>
                        {label}
                        <div className={styles.Actions}>
                            {onRemove ? <Remove onClick={onRemove} /> : undefined}
                            <Handle {...handleProps} />
                        </div>
                    </div>
                ) : null}
                {placeholder ? children : <ul>{children}</ul>}
            </Component>
        );
    }
);
