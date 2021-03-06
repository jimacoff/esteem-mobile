import React, { Component } from 'react';
import { View, KeyboardAvoidingView, FlatList, Text, Platform, ScrollView } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { renderPostBody } from '@esteemapp/esteem-render-helpers';

// Utils
import applyImageLink from './formats/applyWebLinkFormat';
import Formats from './formats/formats';

// Components
import { IconButton } from '../../iconButton';
import { PostBody } from '../../postElements';
import { StickyBar } from '../../basicUIElements';
import { TextInput } from '../../textInput';

import { ThemeContainer } from '../../../containers';

// Styles
import styles from './markdownEditorStyles';

export default class MarkdownEditorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: props.draftBody || '',
      selection: { start: 0, end: 0 },
      textUpdated: false,
      newSelection: null,
    };

    this.inputRef = React.createRef();
    this.galleryRef = React.createRef();
    this.clearRef = React.createRef();
  }

  // Lifecycle functions
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { draftBody, uploadedImage, isPreviewActive } = this.props;
    if (!nextProps.isPreviewActive && isPreviewActive) {
      this.setState({
        selection: { start: 0, end: 0 },
      });
    }
    if (nextProps.draftBody && draftBody !== nextProps.draftBody) {
      this.setState({
        text: nextProps.draftBody,
      });
    }

    if (
      nextProps.uploadedImage &&
      nextProps.uploadedImage.url &&
      nextProps.uploadedImage !== uploadedImage
    ) {
      applyImageLink({
        getState: this._getState,
        setState: async (state, callback) => {
          await this.setState(state, callback);
        },
        item: { url: nextProps.uploadedImage.url, text: nextProps.uploadedImage.hash },
        isImage: !!nextProps.uploadedImage,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { text } = this.state;
    const { handleIsFormValid } = this.props;

    if (prevState.text !== text) {
      const nextText = text.replace(prevState.text, '');

      if (nextText && nextText.length > 0) {
        this._changeText(text);

        if (handleIsFormValid) {
          handleIsFormValid(text);
        }
      }
    }
  }

  // Component functions
  _changeText = input => {
    const { onChange, handleOnTextChange, handleIsValid, componentID } = this.props;

    this.setState({ text: input });

    if (onChange) {
      onChange(input);
    }

    if (handleIsValid) {
      handleIsValid(componentID, !!(input && input.length));
    }

    if (handleOnTextChange) {
      handleOnTextChange(input);
    }
  };

  _handleOnSelectionChange = event => {
    const { newSelection } = this.state;

    if (newSelection) {
      this.setState({
        selection: newSelection,
        newSelection: null,
      });
      return;
    }
    this.setState({
      selection: event.nativeEvent.selection,
    });
  };

  _getState = () => {
    return this.state;
  };

  _renderPreview = () => {
    const { text } = this.state;

    return (
      <ScrollView style={styles.previewContainer}>
        {text ? <PostBody body={renderPostBody(text)} /> : <Text>...</Text>}
      </ScrollView>
    );
  };

  _renderMarkupButton = ({ item, getState, setState }) => (
    <View style={styles.buttonWrapper}>
      <IconButton
        size={20}
        style={styles.editorButton}
        iconStyle={styles.icon}
        iconType={item.iconType}
        name={item.icon}
        onPress={() => item.onPress({ getState, setState, item })}
      />
    </View>
  );

  _renderEditorButtons = ({ getState, setState }) => (
    <StickyBar>
      <View style={styles.leftButtonsWrapper}>
        <FlatList
          data={Formats}
          keyboardShouldPersistTaps="always"
          renderItem={({ item, index }) =>
            index !== 9 && this._renderMarkupButton({ item, getState, setState })
          }
          horizontal
        />
      </View>
      <View style={styles.rightButtonsWrapper}>
        <IconButton
          size={20}
          style={styles.rightIcons}
          iconStyle={styles.icon}
          iconType="FontAwesome"
          name="link"
          onPress={() => Formats[9].onPress({ getState, setState })}
        />
        <IconButton
          onPress={() => this.galleryRef.current.show()}
          style={styles.rightIcons}
          size={20}
          iconStyle={styles.icon}
          iconType="FontAwesome"
          name="image"
        />
        <View style={styles.clearButtonWrapper}>
          <IconButton
            onPress={() => this.clearRef.current.show()}
            size={20}
            iconStyle={styles.clearIcon}
            iconType="FontAwesome"
            name="trash"
            backgroundColor={styles.clearButtonWrapper.backgroundColor}
          />
        </View>
      </View>
    </StickyBar>
  );

  _handleClear = () => {
    const { initialFields } = this.props;

    initialFields();

    this.setState({ text: '' });
  };

  render() {
    const { handleOpenImagePicker, intl, isPreviewActive, isReply, isLoading } = this.props;
    const { text, selection } = this.state;

    return (
      <KeyboardAvoidingView
        style={styles.container}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 25 })}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        {!isPreviewActive ? (
          <ThemeContainer>
            {({ isDarkTheme }) => (
              <TextInput
                multiline
                onChangeText={this._changeText}
                onSelectionChange={this._handleOnSelectionChange}
                placeholder={intl.formatMessage({
                  id: isReply ? 'editor.reply_placeholder' : 'editor.default_placeholder',
                })}
                placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
                selection={selection}
                selectionColor="#357ce6"
                style={styles.textWrapper}
                underlineColorAndroid="transparent"
                value={text}
                innerRef={this.inputRef}
                editable={!isLoading}
              />
            )}
          </ThemeContainer>
        ) : (
          this._renderPreview()
        )}
        {!isPreviewActive &&
          this._renderEditorButtons({
            getState: this._getState,
            setState: (state, callback) => {
              this.inputRef.current.focus();
              this.setState(state, callback);
            },
          })}
        <ActionSheet
          ref={this.galleryRef}
          options={[
            intl.formatMessage({
              id: 'editor.open_gallery',
            }),
            intl.formatMessage({
              id: 'editor.capture_photo',
            }),
            intl.formatMessage({
              id: 'alert.cancel',
            }),
          ]}
          cancelButtonIndex={2}
          onPress={index => {
            handleOpenImagePicker(index === 0 ? 'image' : index === 1 && 'camera');
          }}
        />
        <ActionSheet
          ref={this.clearRef}
          title={intl.formatMessage({
            id: 'alert.clear_alert',
          })}
          options={[
            intl.formatMessage({
              id: 'alert.clear',
            }),
            intl.formatMessage({
              id: 'alert.cancel',
            }),
          ]}
          cancelButtonIndex={1}
          onPress={index => index === 0 && this._handleClear()}
        />
      </KeyboardAvoidingView>
    );
  }
}
