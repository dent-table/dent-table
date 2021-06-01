import {animate, animation, group, state, style, transition, trigger, useAnimation} from '@angular/animations';

export const fabEnterAnimation = animation([
  style({ transform: 'scale(0) rotate(360deg)' }),
  group([
    animate('300ms {{delay}} cubic-bezier(0.4, 0.0, 1, 1)',
      style({ transform: 'scale(1) rotate(0deg)' })),
  ]),
]);

export const fabExitAnimation = animation([
  style({ transform: 'scale(1) rotate(0deg)', opacity: 1 }),
  group([
    animate('300ms {{delay}} cubic-bezier(0.4, 0.0, 1, 1)',
      style({ transform: 'scale(0) rotate(360deg)' })),
    // animate('300ms {{delay}}',
    //   style({ opacity: 0 }))
  ]),
]);


export const FAB_ANIMATION_TRIGGER = trigger(
  'fabAnimation',
  [
    state('invisible', style({transform: 'scale(0)'})),
    state('visible', style({transform: 'scale(1)'})),
    transition(
      ':enter',
      useAnimation(fabEnterAnimation, {params: {delay: '350ms'}})
    ),
    // transition(':leave',
    //   useAnimation(fabExitAnimation, {params: {delay: '0ms'}})),
    transition(
      'invisible => visible',
      useAnimation(fabEnterAnimation, {params: {delay: '0ms'}})
    ),
    transition(
      ':leave, visible => invisible',
      useAnimation(fabExitAnimation, {params: {delay: '0ms'}})
    )
  ]
);

