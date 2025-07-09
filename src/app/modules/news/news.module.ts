import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsRoutingModule } from './news-routing.module';
import { NewsComponent } from './news.component';
import { NewsFeedComponent } from './components/news-feed/news-feed.component'; // 👈 importa el componente

@NgModule({
  declarations: [
    NewsComponent,
    NewsFeedComponent // 👈 agrégalo aquí
  ],
  imports: [
    CommonModule,
    NewsRoutingModule,
    FormsModule
  ]
})
export class NewsModule { }
