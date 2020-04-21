import React from 'react';
import styles from './UserPage.m.css';

import {
    Backdrop,
    Button,
    IconButton,
    Divider,
    DropdownContainer,
    DropdownMenu,
    DropdownItem,
    Loading,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalImage,
    ModalWindow,
    Row
} from '../../shared';

import { getMyId, history } from '../../middleware';
import { toast as notify } from 'react-toastify';

import defaultAvatar from '../../images/default_avatar.png';
import iconEditGray from '../../shared/icons/icon_edit_gray.png';
import iconCrossWhite from '../../shared/icons/icon_cross_white.png';
import iconCrossGray from '../../shared/icons/icon_cross_gray.png';

interface PropsType {
    
}

interface StateType {
    avatar: string,
    userName: string,
    basicInfo: any[],
    additInfo: any[],
    changeAvatar: {
        window: boolean,
        preview: string
    },
    newAvatar: string | undefined,
    fullAvatarWindow: boolean
}

const fieldNames: any = {
    gender: "Пол",
    birthday: "День рождения",
    country: "Страна",
    city: "Город",
    family_status: "Семейное положение",
    activity: "Деятельность",
    interests: "Интересы",
    hobby: "Хобби",
    about_self: "О себе"
}

const genderField: any = {
    male: "Мужской",
    female: "Женский"
}

const maleFamilyStatus: any = {
    married: "Женат",
    free: "Свободен",
    has_partner: "Есть девушка",
    want_meet: "Познакомлюсь",
    not_selected: "Не выбрано"
}

const femaleFamilyStatus: any = {
    married: "Замужем",
    free: "Свободна",
    has_partner: "Есть парень",
    want_meet: "Познакомлюсь",
    not_selected: "Не выбрано"
}

class UserPage extends React.Component <{}, StateType> {
    fileInput: any;
    constructor(props: any) {
        super(props);
        this.fileInput = React.createRef();
        this.state = {
            avatar: "",
            userName: "",
            basicInfo: [],
            additInfo: [],
            changeAvatar: {
                window: false,
                preview: ""
            },
            newAvatar: undefined,
            fullAvatarWindow: false
        };
    }

    async componentDidMount() {
        await this.updateUserData();
    }

    updateUserData = async() => {
        const myId = await getMyId();

        const resUserData = await fetch(`/api/users/get_user_data/${myId}`);
        const userData = await resUserData.json();

        const resAvatar = await fetch(`/api/avatars/${userData.avatar}`);
        
        const basicInfo: any[] = [];
        const additInfo: any[] = [];

        for (let prop in userData) {
            if (/^(gender|birthday|country|city|family_status)$/.test(prop)) {
                let value = userData[prop];
                if (prop === "gender") {
                    value = genderField[userData[prop]];
                } else if (prop === "family_status" && userData.gender === "male") {
                    value = maleFamilyStatus[userData[prop]];
                } else if (prop === "family_status" && userData.gender === "female") {
                    value = femaleFamilyStatus[userData[prop]];
                }

                basicInfo.push([
                    fieldNames[prop], 
                    value
                    
                ]);
            } else if (/^(activity|interests|hobby|about_self)$/.test(prop) && userData[prop]) {
                additInfo.push([
                    fieldNames[prop], 
                    userData[prop]
                ]);
            }
        }

        this.setState({ 
            userName: userData.name,
            avatar: resAvatar.url,
            basicInfo,
            additInfo
        });
    }

    uploadAvatar = async (e: any) => {
        if (!this.state.newAvatar) {
            notify.warn("Выберите изображение");
            return;
        }

        const myId = await getMyId();

        const resUserData = await fetch(`/api/users/get_user_data/${myId}`);
        const userData = await resUserData.json();

        if (userData.avatar !== "default.png") {
            await this.deleteAvatar();
        }

        const files = new FormData();
        files.append("avatar", this.fileInput.current.files[0]);

        await fetch(`/api/users/set_avatar/${myId}`, {
            method: "POST",
            body: files
        });

        this.setChangeAvatarWindow(false);
        this.updateUserData();
    }

    avatarHandler = () => {
        if (this.state.avatar === 'http://localhost:3000/api/avatars/default.png') {
            this.setChangeAvatarWindow(true);
        } else {
            this.setFullAvatar(true);
        }
    }

    deleteAvatar = async () => {
        const myId = await getMyId();
        
        await fetch(`/api/users/set_avatar/${myId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify({
                avatar: null
            })
        });

        this.updateUserData();
    }

    selectImage = () => {
        if (!this.fileInput.current.files[0]) {
            this.setChangeAvatarWindow(true);
            return;
        }

        const fileList = this.fileInput.current.files;
        const url = URL.createObjectURL(this.fileInput.current.files[0]);

        this.setState({ 
            newAvatar: fileList.length ? fileList[0].name : undefined,
            changeAvatar: {
                window: this.state.changeAvatar.window,
                preview: url
            }
        })
    }

    setChangeAvatarWindow = (value: boolean) => {
        this.setState({ changeAvatar: {
            window: value,
            preview: ""
        } });
    }

    setFullAvatar = (value: boolean) => {
        this.setState({ fullAvatarWindow: value });
    }

    render() {
        return (
            <div className={styles.UserPage}>

                <div className={styles.left_column}>
                    <div className={styles.avatar}
                        onClick={this.avatarHandler}
                    >
                        {this.state.avatar && <img src={this.state.avatar} width="200" height="200" alt="*" />}
                        <div className={styles.edit_avatar}
                            onClick={(e: any) => e.stopPropagation()}
                        >
                            <DropdownContainer control="cntrl-edit-ava-menu">
                                <IconButton size="small" id="cntrl-edit-ava-menu">
                                    <img src={iconEditGray} width={12} height={12} />
                                </IconButton>
                                <DropdownMenu placement="right"
                                    arrow={{ right: 9 }}
                                >
                                    <DropdownItem onClick={() => this.setChangeAvatarWindow(true)}>
                                        Сменить фото
                                    </DropdownItem>

                                    <DropdownItem onClick={this.deleteAvatar}>
                                        Удалить фото
                                    </DropdownItem>
                                </DropdownMenu>
                            </DropdownContainer>
                        </div>
                    </div>
                </div>

                <div className={styles.right_column}>
                    <div className={styles.user_data}>
                        <div className={styles.header}>
                            <span>
                                {this.state.userName}
                            </span>
                        </div>

                        <Divider spaceY={8} />

                        <p className={styles.user_data_header}>Основная информация:</p>

                        <table className={styles.user_data_table}>
                            <tbody>
                                {this.state.basicInfo.map((prop, index) => {
                                    return (
                                        <tr key={"bscnf" + index}>
                                            <td>{prop[0]}:</td>
                                            <td>{prop[1]}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        <Divider spaceY={8} />

                        <p className={styles.user_data_header}>Дополнительная информация:</p>
                        
                        <table className={styles.user_data_table}>
                            <tbody>
                                {this.state.additInfo.map((prop, index) => {
                                    return (
                                        <tr key={"ddtnf" + index}>
                                            <td>{prop[0]}:</td>
                                            <td>{prop[1]}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                    </div>
                </div>

                <Backdrop blackout
                    isOpened={this.state.changeAvatar.window}
                    onClose={() => this.setChangeAvatarWindow(false)}
                >
                    <ModalWindow size="large">
                        <ModalHeader>
                            <span>Загрузить фото</span>
                            <IconButton onClick={() => this.setChangeAvatarWindow(false)}>
                                <img src={iconCrossWhite} width={18} height={18} />
                            </IconButton>
                        </ModalHeader>
                        <ModalBody align="center">
                            <div className={styles.avatar_file_input}>
                                {!this.state.changeAvatar.preview && <Button color="info">
                                    <label>
                                        <input type="file" 
                                            ref={this.fileInput} 
                                            name="audio"
                                            onChange={this.selectImage}
                                        />
                                    </label>
                                    Выберите изображение
                                </Button>}

                                {this.state.changeAvatar.preview &&
                                    <img src={this.state.changeAvatar.preview} />
                                }
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary"
                                onClick={this.uploadAvatar}
                            >
                                Сохранить
                            </Button>
                        </ModalFooter>
                    </ModalWindow>
                </Backdrop>

                <Backdrop 
                    blackout
                    isOpened={this.state.fullAvatarWindow}
                    onClose={() => this.setFullAvatar(false)}
                >
                    <ModalWindow size="very_large">
                        <ModalImage image={this.state.avatar}
                            closeButton={
                                <IconButton onClick={() => this.setFullAvatar(false)}>
                                    <img src={iconCrossGray} width={18} height={18} />
                                </IconButton>
                            }
                        >
                            <Button color="info" 
                                size="small"
                                style={{ width: 180 }}
                                onClick={() => window.open(this.state.avatar)}
                            >
                                Открыть оригинал
                            </Button>
                            <Divider spaceY={3} bg="transparent" />
                        </ModalImage>
                    </ModalWindow>
                </Backdrop>
            </div>
        );
    }
}

export default UserPage;