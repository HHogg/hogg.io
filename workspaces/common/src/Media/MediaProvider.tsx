import { createMedia } from '@artsy/fresnel';

export const {
  MediaContextProvider,
  Media: FresnelMedial,
  createMediaStyle,
} = createMedia({
  breakpoints: {
    mobile: 0,
    desktop: 800,
  },
});
