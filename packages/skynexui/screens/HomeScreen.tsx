import { Box, Text, useTheme } from '../index';
import AppScreenHOC from './wrappers/AppScreenHOC';

export function HomeScreen() {
  const theme = useTheme();
  return (
    <Box
      styleSheet={{
        flex: 1,
        backgroundColor: theme.colors?.neutral.x050,
        justifyContent: 'center',
      }}
    >
      <Text
        tag='h3'
        variant='heading2'
        styleSheet={{
          backgroundColor: theme.colors?.positive.x050,
          color: {
            xs: theme.colors?.warning.x600,
            sm: theme.colors?.positive.x600,
            md: theme.colors?.negative.x600,
            lg: theme.colors?.negative.x600,
            xl: theme.colors?.neutral.x600,
          },
        }}
      >
        Home Screen sample!!!
      </Text>
    </Box>
  );
}

export default AppScreenHOC(HomeScreen);