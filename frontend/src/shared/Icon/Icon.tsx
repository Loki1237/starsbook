import React from 'react';
import styles from './Styles.m.css';
import classNames from 'classnames';

import { icons } from './ImportImages';

interface Props {
    img: string,
    color?: "black" | "gray" | "white",
    size?: "very_small" | "small" | "medium" | "large" | "very_large" | "extra_large",
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const Icon = (props: Props) => {
    const imgClassNames = classNames({
        [styles.image]: true,
        [styles[`${props.color}`]]: props.color,
        [styles[`${props.size}`]]: props.size
    });

    return (
        <div className={styles.Icon}>
            <img src={icons[props.img]}
                className={imgClassNames}
                alt="icon not found"
            />
        </div>
    );
}

export default Icon;
