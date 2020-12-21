import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { findIndex } from 'lodash';
import { interval, Subscription } from 'rxjs';
import { ROCKET_CONFIG } from './config';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.sass']
})
export class AnimationComponent implements OnInit, OnDestroy, AfterViewInit {

  rateSum = 0;
  animMsGap = 400;
  mockProgressCondition: any;
  mockProgressSb: Subscription;

  isBegin = false;
  isCrashed = false;
  isEscape = false;
  currenyOdds = '1.00';

  private subscribeList: Subscription[] = [];

  @Input() animHeight: number;
  @Input() animWidth: number;

  @ViewChild('animation') animation: ElementRef;
  @ViewChild('rocketBody') rocketBody: ElementRef;
  @ViewChild('fumes') fumes: ElementRef;

  constructor() {}

  ngOnInit(): void {
    const mockProgress = interval(this.animMsGap);
    this.mockProgressCondition = mockProgress.pipe(take(100));
  }

  ngOnDestroy(): void {
    this.subscribeList.forEach((sb) => sb.unsubscribe());
  }

  ngAfterViewInit() {
    const anim = this.animation.nativeElement;

    this.animHeight === 0
      ? (anim.style.height = '100%')
      : (anim.style.height = `${this.animHeight}px`);
    this.animWidth === 0
      ? (anim.style.width = '100%')
      : (anim.style.width = `${this.animWidth}px`);
  }

  resetState() {
    this.currenyOdds = '1.00';
    this.rateSum = 0;
    this.isBegin = false;
    this.isCrashed = false;
    this.isEscape = false;
    this.animation.nativeElement.style.removeProperty('transition');
    this.animation.nativeElement.style.removeProperty('background-position-y');
  }

  parseOdds(sec: number): string {
    const sampleIndex = findIndex(
      ROCKET_CONFIG,
      (item: any) => item.total_need > sec
    );

    const lessItem = ROCKET_CONFIG[sampleIndex];

    const fillItem = ROCKET_CONFIG[sampleIndex - 1];

    const odds_int = lessItem.odds_int;

    const odds_surplus =
      (sec - (fillItem ? fillItem.total_need : 0)) / lessItem.gap / 100;

    const odds = odds_int + odds_surplus;

    const xxx = odds.toFixed(4);
    const odds_surplus_int = Number(xxx.split('.')[0]);
    const odds_surplus_float = xxx.split('.')[1].substring(0, 2);

    return `${odds_surplus_int}.${odds_surplus_float}`;
  }

  start() {
    if (this.isBegin) {
      return;
    }

    this.mockProgressSb = this.mockProgressCondition.subscribe((x: number) => {
      if (x === 0) {
        this.isBegin = true;
        this.rocketBody.nativeElement.style = '';
        this.fumes.nativeElement.style.top = '300px';
      }

      const s = (x * this.animMsGap) / 1000; // 秒數
      const odd = this.parseOdds(s); // 賠率
      this.currenyOdds = odd;

      const oddDigitel = Number(odd) - 1;
      const rate = oddDigitel / s || 0; // 速率

      this.rateSum = this.rateSum + rate * 1000;
      this.animation.nativeElement.style.transition =
        'background-position 1s linear';
      this.animation.nativeElement.style.backgroundPositionY = `${this.rateSum}px`;
    });

    this.subscribeList.push(this.mockProgressSb);
  }

  crashed() {
    this.mockProgressSb.unsubscribe();

    this.isBegin = false;
    this.isCrashed = true;
  }

  escape() {
    this.isEscape = true;
  }

  reset() {
    this.resetState();
  }
}
