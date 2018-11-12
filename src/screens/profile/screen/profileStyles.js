import EStyleSheet from 'react-native-extended-stylesheet';
import { StatusBar } from 'react-native';

export default EStyleSheet.create({
  container: {
    flex: 1,
    top: StatusBar.currentHeight,
    backgroundColor: '$primaryGray',
  },
  content: {
    backgroundColor: '$primaryGray',
  },
  cover: {
    width: '$deviceWidth',
    height: 160,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -50,
    borderWidth: 1,
    borderColor: '$white',
    alignSelf: 'center',
  },
  about: {
    borderColor: '$primaryLightGray',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  info: {
    flexDirection: 'row',
    borderBottomWidth: 0,
  },
  tabs: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  tabbar: {
    alignSelf: 'center',
    height: 50,
    backgroundColor: '$white',
    borderBottomColor: '#f1f1f1',
  },
  tabbarItem: {
    flex: 1,
    paddingHorizontal: 7,
    backgroundColor: '#f9f9f9',
    minWidth: '$deviceWidth',
  },
  tabView: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  postTabBar: {
    backgroundColor: '$white',
  },
  commentsTabBar: {
    backgroundColor: '$white',
  },
  tabBarTitle: {},
});
