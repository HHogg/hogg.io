import { createMedia } from '@artsy/fresnel';

export const {
  MediaContextProvider,
  Media: FresnelMedia,
  createMediaStyle,
} = createMedia({
  breakpoints: {
    mobile: 0,
    desktop: 1025,
  },
});
