# Animation Components - Framer Motion

Các animation components sử dụng Framer Motion cho dự án DroniVerse.

## Cài đặt

Framer Motion đã được cài đặt sẵn trong dự án.

## Components

### 1. FadeIn
Hiệu ứng fade in với khả năng di chuyển từ các hướng khác nhau.

```tsx
import { FadeIn } from '@/components/animation';

<FadeIn 
  duration={1} 
  delay={0} 
  from="bottom"
  distance={50}
>
  <h1>Nội dung của bạn</h1>
</FadeIn>
```

**Props:**
- `duration`: Thời gian animation (giây) - mặc định: 1
- `delay`: Độ trễ trước khi bắt đầu (giây) - mặc định: 0
- `from`: Hướng di chuyển ('top' | 'bottom' | 'left' | 'right' | 'center') - mặc định: 'center'
- `distance`: Khoảng cách di chuyển (px) - mặc định: 50
- `ease`: Easing function - mặc định: 'power2.out'
- `onComplete`: Callback khi animation hoàn thành

### 2. SlideIn
Hiệu ứng slide in từ các hướng.

```tsx
import { SlideIn } from '@/components/animation';

<SlideIn 
  direction="left" 
  duration={0.8}
  distance={100}
>
  <div>Nội dung slide từ trái</div>
</SlideIn>
```

**Props:**
- `direction`: Hướng slide ('left' | 'right' | 'top' | 'bottom') - mặc định: 'left'
- `duration`: Thời gian animation - mặc định: 0.8
- `delay`: Độ trễ - mặc định: 0
- `distance`: Khoảng cách - mặc định: 100
- `ease`: Easing function - mặc định: 'power3.out'

### 3. ScaleIn
Hiệu ứng phóng to/thu nhỏ.

```tsx
import { ScaleIn } from '@/components/animation';

<ScaleIn 
  duration={0.6}
  from={0}
>
  <button>Click me</button>
</ScaleIn>
```

**Props:**
- `duration`: Thời gian animation - mặc định: 0.6
- `delay`: Độ trễ - mặc định: 0
- `from`: Scale bắt đầu (0-1) - mặc định: 0
- `ease`: Easing function - mặc định: 'back.out(1.7)'

### 4. RotateIn
Hiệu ứng xoay khi xuất hiện.

```tsx
import { RotateIn } from '@/components/animation';

<RotateIn 
  duration={0.8}
  rotation={360}
>
  <div>Nội dung xoay</div>
</RotateIn>
```

**Props:**
- `duration`: Thời gian animation - mặc định: 0.8
- `delay`: Độ trễ - mặc định: 0
- `rotation`: Góc xoay (độ) - mặc định: 360
- `ease`: Easing function - mặc định: 'power2.out'

### 5. StaggerContainer
Hiệu ứng stagger cho nhiều phần tử con.

```tsx
import { StaggerContainer } from '@/components/animation';

<StaggerContainer 
  stagger={0.1}
  from="bottom"
  duration={0.6}
>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</StaggerContainer>
```

**Props:**
- `stagger`: Độ trễ giữa các items (giây) - mặc định: 0.1
- `duration`: Thời gian animation mỗi item - mặc định: 0.6
- `delay`: Độ trễ ban đầu - mặc định: 0
- `from`: Hướng animation ('top' | 'bottom' | 'left' | 'right' | 'scale') - mặc định: 'bottom'
- `distance`: Khoảng cách di chuyển - mặc định: 50
- `childClassName`: Class cho mỗi child element

### 6. ScrollTrigger
Hiệu ứng kích hoạt khi scroll đến phần tử.

```tsx
import { ScrollTrigger } from '@/components/animation';

<ScrollTrigger 
  animation="slideUp"
  start="top 80%"
  once={true}
>
  <div>Xuất hiện khi scroll</div>
</ScrollTrigger>
```

**Props:**
- `animation`: Loại animation ('fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale') - mặc định: 'fade'
- `duration`: Thời gian animation - mặc định: 1
- `start`: Vị trí bắt đầu trigger - mặc định: 'top 80%'
- `end`: Vị trí kết thúc trigger - mặc định: 'bottom 20%'
- `scrub`: Liên kết với scroll - mặc định: false
- `markers`: Hiển thị markers debug - mặc định: false
- `once`: Chỉ chạy một lần - mặc định: true

### 7. Bounce
Hiệu ứng nhảy lặp lại.

```tsx
import { Bounce } from '@/components/animation';

<Bounce 
  duration={0.5}
  scale={1.1}
  repeat={-1}
>
  <div>Nhảy liên tục</div>
</Bounce>
```

**Props:**
- `duration`: Thời gian một chu kỳ - mặc định: 0.5
- `delay`: Độ trễ - mặc định: 0
- `repeat`: Số lần lặp (-1 = vô hạn) - mặc định: -1
- `yoyo`: Đảo ngược animation - mặc định: true
- `scale`: Mức độ phóng to - mặc định: 1.1

### 8. FloatingElement
Hiệu ứng floating (bay lơ lửng).

```tsx
import { FloatingElement } from '@/components/animation';

<FloatingElement 
  duration={2}
  distance={20}
>
  <div>Bay lơ lửng</div>
</FloatingElement>
```

**Props:**
- `duration`: Thời gian một chu kỳ - mặc định: 2
- `distance`: Khoảng cách di chuyển (px) - mặc định: 20

## Ví dụ sử dụng trong dự án

### Landing Page với nhiều animations

```tsx
import { FadeIn, SlideIn, StaggerContainer, ScrollTrigger } from '@/components/animation';

export default function HomePage() {
  return (
    <div>
      {/* Hero section */}
      <FadeIn from="top" duration={1}>
        <h1>Welcome to DroniVerse</h1>
      </FadeIn>

      {/* Features list */}
      <StaggerContainer stagger={0.2} from="left">
        <div>Feature 1</div>
        <div>Feature 2</div>
        <div>Feature 3</div>
      </StaggerContainer>

      {/* Scroll-triggered content */}
      <ScrollTrigger animation="slideUp" once={true}>
        <div>Content appears on scroll</div>
      </ScrollTrigger>
    </div>
  );
}
```

### Button với hiệu ứng

```tsx
import { ScaleIn } from '@/components/animation';

export function AnimatedButton() {
  return (
    <ScaleIn duration={0.5} from={0}>
      <button className="px-4 py-2 bg-blue-500 text-white rounded">
        Click Me
      </button>
    </ScaleIn>
  );
}
```

### Card grid với stagger

```tsx
import { StaggerContainer } from '@/components/animation';

export function CardGrid({ cards }) {
  return (
    <StaggerContainer 
      stagger={0.1}
      from="bottom"
      className="grid grid-cols-3 gap-4"
    >
      {cards.map((card) => (
        <div key={card.id} className="card">
          {card.content}
        </div>
      ))}
    </StaggerContainer>
  );
}
```

## Tips

1. **Performance**: Sử dụng `will-change` CSS property cho các phần tử có animation phức tạp
2. **Accessibility**: Cân nhắc người dùng có thể bị ảnh hưởng bởi animation, có thể thêm option để tắt
3. **Mobile**: Giảm độ phức tạp animation trên thiết bị di động
4. **Combination**: Có thể kết hợp nhiều animations bằng cách nest components

## Tài liệu tham khảo

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Framer Motion API](https://www.framer.com/motion/component/)
- [Framer Motion Examples](https://www.framer.com/motion/examples/)
