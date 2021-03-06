/* eslint-disable react/jsx-wrap-multilines */
import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { View, FlatList, Text } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import ActionSheet from 'react-native-actionsheet';
import { postBodySummary } from '@esteemapp/esteem-render-helpers';

// Utils
import { catchDraftImage } from '../../../utils/image';
import { getFormatedCreatedDate } from '../../../utils/time';

// Components
import { BasicHeader, TabBar, PostListItem, PostCardPlaceHolder } from '../../../components';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './draftStyles';

class DraftsScreen extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      selectedId: null,
    };
  }

  // Component Life Cycles

  // Component Functions

  _renderItem = (item, type) => {
    const { currentAccount, removeDraft, editDraft, removeSchedule } = this.props;
    const tags = item.tags ? item.tags.split(/[ ,]+/) : [];
    const tag = tags[0] || '';
    const image = catchDraftImage(item.body);
    const summary = postBodySummary({ item, last_update: item.created }, 100);
    const isSchedules = type === 'schedules';

    return (
      <PostListItem
        created={isSchedules ? getFormatedCreatedDate(item.schedule) : item.created}
        mainTag={tag}
        title={item.title}
        isFormatedDate={isSchedules}
        summary={summary}
        image={image ? { uri: catchDraftImage(item.body) } : null}
        username={currentAccount.name}
        reputation={currentAccount.reputation}
        handleOnPressItem={() =>
          isSchedules
            ? this.setState({ selectedId: item._id }, () => this.ActionSheet.show())
            : editDraft(item._id)
        }
        handleOnRemoveItem={isSchedules ? removeSchedule : removeDraft}
        id={item._id}
        key={item._id}
      />
    );
  };

  _renderEmptyContent = () => {
    const { isLoading, intl } = this.props;

    if (isLoading) {
      return (
        <View>
          <PostCardPlaceHolder />
          <PostCardPlaceHolder />
        </View>
      );
    }

    return (
      <Text style={globalStyles.hintText}>
        {intl.formatMessage({
          id: 'drafts.empty_list',
        })}
      </Text>
    );
  };

  _getTabItem = (data, type) => (
    <View style={globalStyles.lightContainer}>
      <FlatList
        data={data}
        keyExtractor={item => item._id}
        removeClippedSubviews={false}
        renderItem={({ item }) => this._renderItem(item, type)}
        ListEmptyComponent={this._renderEmptyContent()}
      />
    </View>
  );

  render() {
    const { drafts, schedules, intl, moveScheduleToDraft } = this.props;
    const { selectedId } = this.state;

    return (
      <View style={globalStyles.container}>
        <BasicHeader
          title={intl.formatMessage({
            id: 'drafts.title',
          })}
        />

        <ScrollableTabView
          style={globalStyles.tabView}
          renderTabBar={() => (
            <TabBar
              style={styles.tabbar}
              tabUnderlineDefaultWidth={80}
              tabUnderlineScaleX={2}
              tabBarPosition="overlayTop"
            />
          )}
        >
          <View
            tabLabel={intl.formatMessage({
              id: 'drafts.title',
            })}
            style={styles.tabbarItem}
          >
            {this._getTabItem(drafts, 'drafts')}
          </View>
          <View
            tabLabel={intl.formatMessage({
              id: 'schedules.title',
            })}
            style={styles.tabbarItem}
          >
            {this._getTabItem(schedules, 'schedules')}
          </View>
        </ScrollableTabView>
        <ActionSheet
          ref={o => (this.ActionSheet = o)}
          title={intl.formatMessage({
            id: 'alert.move_question',
          })}
          options={[
            intl.formatMessage({
              id: 'alert.move',
            }),
            intl.formatMessage({
              id: 'alert.cancel',
            }),
          ]}
          cancelButtonIndex={1}
          onPress={index => {
            index === 0 && moveScheduleToDraft(selectedId);
          }}
        />
      </View>
    );
  }
}

export default injectIntl(DraftsScreen);
