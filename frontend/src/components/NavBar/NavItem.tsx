import React from 'react';
import styles from './Styles.m.css';
import { Link } from 'react-router-dom';
import { Icon } from '../../shared';

interface Props {
    href: string,
    text: string,
    icon: string
}

const NavItem = (props: Props) => {
    return (
        <Link to={props.href} className={styles.NavItem}>
            <Icon img={props.icon} size="small" />

            <span>{props.text}</span>
        </Link>
    );
}

export default NavItem;
