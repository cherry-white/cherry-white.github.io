import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import List from '@/components/list';
import logo from '@/assets/images/logo.png';
import styles from './about.module.scss';

const About = () => {
  return (
    <View className={styles.about}>
      <Image className={styles.logo} src={logo} mode='aspectFill' />
      <Text className={styles.title}>Cherry White</Text>
      <View className={styles.listWrapper}>
        <List
          title='GitHub'
          icon='github'
          arrow
          extraText='Cherry White'
          onClick={
            () =>
              Taro.setClipboardData({
                data: 'https://gitee.com/zj1789139001',
              })
          }
        />
        <List
          title='QQ'
          icon='QQ'
          arrow
          extraText='1789139001'
          onClick={
            () =>
              Taro.setClipboardData({
                data: '1789139001',
              })
          }
        />
      </View>
    </View>
  );
};

export default About;
