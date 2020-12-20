import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { findIndex } from 'lodash';
import { interval, Observable } from 'rxjs';
import { rocketConfig } from './config';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.sass']
})
export class AnimationComponent implements OnInit, AfterViewInit {

  n = 0;
  gap = 400;
  takeFourNumbers: any;
  qweqwe: any;

  isCrashed = false;

  @Input() height: number = 0;
  @Input() width: number = 0;

  @ViewChild('animation') animation: any;
  @ViewChild('rocketBody') rocketBody: any;
  @ViewChild('fumes') fumes: any;
  
  constructor() {
  }

  ngOnInit(): void {
    const numbers = interval(this.gap);
    this.takeFourNumbers = numbers.pipe(take(150));
  }

  ngAfterViewInit() {
    const anim = this.animation.nativeElement;

    this.height === 0 ? anim.style.height = '100%' : anim.style.height = `${this.height}px`;
    this.width === 0 ? anim.style.width = '100%' : anim.style.width = `${this.width}px`;
  }

  parseOdds(sec: number): string {
    const sampleIndex = findIndex(rocketConfig, (item) => item.total_need > sec);
  
    const lessItem = rocketConfig[sampleIndex];
  
    const fillItem = rocketConfig[sampleIndex - 1];
  
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
    this.qweqwe = this.takeFourNumbers.subscribe((x: number) => {
      if (x === 0) {
        this.rocketBody.nativeElement.style = '';
        this.fumes.nativeElement.style.top = '300px';
      }

      const s = x * this.gap / 1000; // 秒數
      const odd = this.parseOdds(s); // 賠率

      const aaa = Number(odd) - 1;
      const hhh = aaa / s || 0;

      this.n = this.n + hhh * 1000;
      this.animation.nativeElement.style.backgroundPositionY = `${this.n}px`;
    });
  }

  crashed() {
    this.qweqwe.unsubscribe();
    setTimeout(() => {
      this.isCrashed = true;
    }, 100);
  }
}
