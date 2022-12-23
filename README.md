# my-virtual-scroll

## 설치

`
npm i my-virtual-scroll
`

## 사용

``` typescript
interface Row {
  name: string;
}
// 스크롤이 생성되는 영역
const container: Element;
// 컨텐츠 영역
const wrapper: Element;
// or const myVirtualScroll = new MyVirtualScroll(container, wrapper, {
const myVirtualScroll = new MyVirtualScroll<Row>(container, wrapper, {
  // 옵션
  rowSize: 30,
  bench: 0,
  rows: [],
  direction: 'vertical'
  autoStyles: true
});
myVirtualScroll.addContainerScrollEvent(handleContainerScroll);
```

## Methods

### `addContainerScrollEvent`

가상스크롤에 대한 스크롤 이벤트를 등록합니다.
스크롤 이동 시 Rows Update 및 스타일 변경을 하기 위해 등록할 수 있습니다.

``` typescript
myVirtualScroll.addContainerScrollEvent(handleContainerScroll);
```

### `removeContainerScrollEvent`

가상스크롤 등록 된 스크롤 이벤트를 제거 합니다.

``` typescript
myVirtualScroll.removeContainerScrollEvent(handleContainerScroll);
```

### `getWrapperStyle`

현재 스크롤 위치에 해당하는 Styles를 가져옵니다.
해당 Styles을 container에 주입하여 현재 위치로 이동시킵니다.

``` typescript
myVirtualScroll.getWrapperStyle();
```

### `getRenderRows`

현재 스크롤 위치에 해당하는 Rows 목록을 받아올 수 있습니다.

``` typescript
myVirtualScroll.getRenderRows();
```

### `getRenderFirstRow`

현재 그려진 첫번쨰 Row 번호를 반환합니다.

``` typescript
myVirtualScroll.getRenderRows();
```

### `getRenderLastRow`

현재 그려진 마지막 Row 번호를 반환합니다.

``` typescript
myVirtualScroll.getRenderRows();
```

### `updateRows`

Rows를 업데이트 합니다.
Rows 업데이트 후 DOM 렌더링 완료 후 Return 된 Method를 호출 해 주어야 합니다.

``` typescript
const rendered = myVirtualScroll.updateRows();

rendered();
```

### `moveScrollToRow`

Row에 해당하는 위치로 스크롤을 이동시킵니다.

``` typescript
// 100번째 Row로 스크롤 이동
myVirtualScroll.moveScrollToRow(100);
```

## 옵션

### `rows`

Type: `Row<R>[]`  
Default: `[]`
Requried: `false`

### `rowSize`

Type: `number`  
Default: `0`
Requried: `false`

row의 너비 및 높이 값(px) 입니다.
0 입력 시 동적으로 계산되며, 동적으로 계산 시 최초 한 번 모든 Row가 노출됩니다.

### `bench`

Type: `number`  
Default: `0`
Requried: `false`

위아래 추가로 보여 줄 Row 갯수
화면에 렌더링 된 갯수가 10개이고 bench가 1인 경우 총 12개, bench가 2인 경우 14개가 보입니다.
0으로 설정 할 경우 스크롤 이동 시 빈 화면이 보일 수 있습니다.

### `direction`

Type: `horizontal` | `vertical`
Default: `vertical`
Requried: `false`

가상 스크롤 사용할 방향입니다. (가로, 세로)

### `autoStyles`

Type: `boolean`  
Default: `false`
Requried: `false`

스타일을 자동으로 업데이트 합니다.

## Examples

- [vue3](https://github.com/19911121/my-virtual-scroll/tree/main/examples/vite-vue3)
- [vanilla](https://github.com/19911121/my-virtual-scroll/tree/main/examples/vanilla)