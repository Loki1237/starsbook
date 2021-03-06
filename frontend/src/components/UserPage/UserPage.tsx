import React from 'react';
import styles from './styles/UserPage.m.css';
import defaultAvatar from '../../assets/images/default_avatar.png';

import {
    Backdrop,
    Button,
    IconButton,
    Divider,
    Icon,
    Loading,
    LoadingError,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalWindow
} from '../../shared';

import DataField from './DataField';
import { Link } from 'react-router-dom';
import { history } from '../../middleware';
import _ from "lodash";

import { User } from '../../store/UserPage/types';
import { Photo } from '../../store/Photos/types';

interface Props {
    userId: number,
    urlParams: { id: string, action: string },
    isLoading: boolean,
    error: string,
    currentUser: User,
    pageOwner: "i" | "friend" | "any" | undefined,
    updateUserData: (id: number) => void,
    changeAvatar: (file: FormData) => void,
    resetAvatar: () => void,
    resetState: () => void,
    openImageViewer: (payload: Photo[], index: number) => void,
    sendFriendRequest: (userId: number) => void,
    createDialog: (userId: number) => void
}

class UserPage extends React.Component<Props> {
    fileInput: React.RefObject<HTMLInputElement> = React.createRef();
    state = {
        changeAvatar: {
            window: false,
            preview: ""
        },
        sendingFriendRequestWindow: false
    };

    componentDidMount() {
        this.urlParamsIdChangeHandler();
    }

    componentWillUnmount() {
        this.props.resetState();
    }

    componentDidUpdate(prevProps: Props) {
        const urlParams = this.props.urlParams;

        if (urlParams.id !== prevProps.urlParams.id) {
            this.urlParamsIdChangeHandler();
        } else if (urlParams.action !== prevProps.urlParams.action && urlParams.action === "update") {
            this.urlParamsIdChangeHandler();
            history.push(`/usr/${urlParams.id}`);
        }
    }

    urlParamsIdChangeHandler = () => {
        let id = +this.props.urlParams.id;
        this.props.updateUserData(id);
    }

    avatarHandler = async () => {
        if (!this.props.currentUser.avatar && this.props.currentUser.id !== this.props.userId) {
            return;
        }

        if (!this.props.currentUser.avatar) {
            this.setChangeAvatarWindow(true);
        } else {
            const index = _.findIndex(this.props.currentUser.photos, { url: this.props.currentUser.avatar })
            this.openImage(index);
        }
    }

    setChangeAvatarWindow = (value: boolean) => {
        this.setState({ changeAvatar: {
            window: value,
            preview: value ? "" : this.state.changeAvatar.preview
        } });
    }

    setFile = () => {
        if (!this.fileInput.current) {
            this.setChangeAvatarWindow(true);
            return;
        }

        const fileList = this.fileInput.current.files;

        if (!fileList) {
            this.setChangeAvatarWindow(true);
            return;
        }

        const url = URL.createObjectURL(fileList[0]);

        this.setState({ 
            changeAvatar: {
                window: this.state.changeAvatar.window,
                preview: url
            }
        });
    }

    uploadAvatar = () => {
        if (!this.fileInput.current) {
            this.setChangeAvatarWindow(true);
            return;
        }

        const fileList = this.fileInput.current.files;

        if (!fileList) {
            this.setChangeAvatarWindow(true);
            return;
        }

        const files = new FormData();
        files.append("photo", fileList[0]);
        this.props.changeAvatar(files);
        this.setChangeAvatarWindow(false);
    }

    setSendingFriendRequestWindow = (value: boolean) => {
        this.setState({ sendingFriendRequestWindow: value });
    }

    sendFriendRequest = () => {
        this.props.sendFriendRequest(this.props.currentUser.id);
        this.setSendingFriendRequestWindow(false)
    }

    startDialog = () => {
        this.props.createDialog(this.props.currentUser.id);
    }

    openImage = (index: number) => {
        const photoList = this.props.currentUser.photos;
        this.props.openImageViewer(photoList, index);
    }

    renderLoading = () => (
        <div className={styles.UserPage}>
            <Loading />
        </div>
    );

    renderError = () => (
        <div className={styles.UserPage}>
            <LoadingError error={this.props.error} />
        </div>
    );

    render() {
        if (this.props.error) {
            return this.renderError();
        } else if (this.props.isLoading) {
            return this.renderLoading();
        }

        return (
            <div className={styles.UserPage}>
                <div className={styles.left_column}>

                    {/* ========== Аватар ========== */}
                    <div className={styles.avatar_container}
                        onClick={this.avatarHandler}
                    >
                        <img src={this.props.currentUser.avatar || defaultAvatar} 
                            className={styles.avatar_photo}
                            alt="*" 
                        />
                        {this.props.currentUser.id === this.props.userId && 
                            <div className={styles.edit_avatar}
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                                <div onClick={() => this.setChangeAvatarWindow(true)}>
                                    Заменить фото
                                </div>
                                <div>
                                    Удалить
                                </div>
                            </div>
                        }
                    </div>

                    <Divider spaceY={8} bg="transparent" />

                    {this.props.pageOwner === "i" && 
                        <Button color="primary" 
                            style={{ width: "100%" }}
                            onClick={() => history.push('/edit/basic')}
                        >
                            Редактировать
                        </Button>
                    }

                    {this.props.pageOwner !== "i" && 
                        <Button color="primary" 
                            style={{ width: "100%" }}
                            onClick={this.startDialog}
                        >
                            Начать диалог
                        </Button>
                    }

                    {this.props.pageOwner === "any" && 
                        <Button color="primary" 
                            style={{ width: "100%", margin: "8px 0" }}
                            onClick={() => this.setSendingFriendRequestWindow(true)}
                        >
                            Добавить в друзья
                        </Button>
                    }
                </div>

                {/* ========== Данные пользователя ========== */}
                <div className={styles.right_column}>
                    <div className={styles.user_data}>
                        <div className={styles.header}>
                            <span>
                                {this.props.currentUser.firstName + " " + this.props.currentUser.lastName}
                            </span>
                        </div>

                        {Object.entries(this.props.currentUser.profile).map((item, i, arr) => {
                            return (
                                <React.Fragment key={item[0]}>
                                    {i === 0 && <p className={styles.user_data_header}>
                                        Основная информация:
                                    </p>}

                                    {item[0] === "activity" && <p className={styles.user_data_header}>
                                        Дополнительная информация:
                                    </p>}

                                    <DataField name={item[0]} value={item[1]} />
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>

                {/* ========== Контейнер фотографий ========== */}
                <div className={styles.container}>
                    <Link to={`/photo/${this.props.currentUser.id}`}
                        className={styles.container_header}
                    >
                        Фотографии ({this.props.currentUser.photos.length})
                    </Link>

                    {this.props.currentUser.photos.slice(0, 5).map((photography, index) => (
                        <img key={photography.id}
                            src={photography.url} 
                            className={styles.photography}
                            onClick={() => this.openImage(index)}
                        />
                    ))}
                </div>

                {/* ========== Модалка: загрузить аватар ========== */}
                <Backdrop blackout
                    isOpened={this.state.changeAvatar.window}
                    onClose={() => this.setChangeAvatarWindow(false)}
                >
                    <ModalWindow size="large" 
                        isOpened={this.state.changeAvatar.window}
                    >
                        <ModalHeader>
                            <span>Загрузить фото</span>
                            <IconButton onClick={() => this.setChangeAvatarWindow(false)}>
                                <Icon img="cross" color="white" />
                            </IconButton>
                        </ModalHeader>
                        <ModalBody align="center">
                            {this.state.changeAvatar.preview &&
                                <img className={styles.upload_avatar_preview} 
                                    src={this.state.changeAvatar.preview} 
                                />
                            }
                        </ModalBody>
                        <ModalFooter>
                            <div className={styles.avatar_file_input}>
                                <Button color="info" style={{ marginRight: 20 }}>
                                    <label>
                                        <input type="file" 
                                            ref={this.fileInput} 
                                            name="photo"
                                            onChange={this.setFile}
                                        />
                                    </label>
                                    Выберите изображение
                                </Button>
                            </div>

                            <Button color="primary"
                                disabled={!this.state.changeAvatar.preview}
                                onClick={this.uploadAvatar}
                            >
                                Сохранить
                            </Button>
                        </ModalFooter>
                    </ModalWindow>
                </Backdrop>

                {/* ========== Модалка: отправить заявку в друзья ========== */}
                <Backdrop 
                    blackout
                    isOpened={this.state.sendingFriendRequestWindow}
                    onClose={() => this.setSendingFriendRequestWindow(false)}
                >
                    <ModalWindow isOpened={this.state.sendingFriendRequestWindow}>
                        <ModalBody align="center">
                            Отправить заявку на добавление в друзья
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary"
                                style={{ marginRight: 20 }}
                                onClick={() => this.setSendingFriendRequestWindow(false)}
                            >
                                Отмена
                            </Button>

                            <Button color="primary"
                                onClick={this.sendFriendRequest}
                            >
                                Отправить
                            </Button>
                        </ModalFooter>
                    </ModalWindow>
                </Backdrop>
            </div>
        );
    }
}

export default UserPage;
