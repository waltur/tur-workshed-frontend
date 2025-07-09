import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsComponent } from './news.component';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';

const routes: Routes = [
  { path: '', component: NewsComponent },           // Ver publicaciones
  { path: 'create', component: NewsFeedComponent }  // Crear publicaciones
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsRoutingModule { }
