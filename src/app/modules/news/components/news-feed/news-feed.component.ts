import { Component, OnInit } from '@angular/core';
import { NewsService } from '../services/news.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-news-feed',
  templateUrl: './news-feed.component.html',
  styleUrls: ['./news-feed.component.css']
})
export class NewsFeedComponent implements OnInit {
  newPost = { title: '', description: '', image: '' };
  posts: any[] = [];
 selectedImages: File[] = [];
  mediaUrl = environment.mediaUrl;
  previewImageUrl: string | null = null;
   previewUrl: string | null = null;
   previewUrls: string[] = [];


  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.newsService.getPosts().subscribe(data => {
      this.posts = data;
    });
  }
onFilesSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const allowedTypes = ['image/jpeg', 'image/png'];
  const maxSize = 2 * 1024 * 1024;

  Array.from(input.files).forEach((file) => {
    if (!allowedTypes.includes(file.type)) {
      Swal.fire('Invalid Format', `${file.name} is not JPG or PNG.`, 'warning');
      return;
    }

    if (file.size > maxSize) {
      Swal.fire('Too Large', `${file.name} exceeds 2MB.`, 'warning');
      return;
    }

    this.selectedImages.push(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrls.push(reader.result as string);
    };
    reader.readAsDataURL(file);
  });

  // Limpiar el input para permitir volver a seleccionar la misma imagen
  input.value = '';
}
removeImage(index: number): void {
  this.selectedImages.splice(index, 1);
  this.previewUrls.splice(index, 1);
}
  createPost(): void {
    const { title, description } = this.newPost;

    if (title.trim().length < 5) {
      Swal.fire('Title too short', 'Minimum 5 characters required.', 'warning');
      return;
    }

    if (description.trim().length < 10) {
      Swal.fire('Description too short', 'Minimum 10 characters required.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    this.selectedImages.forEach((image, index) => {
      formData.append('images', image); // El backend debe aceptar 'images'
    });

    this.newsService.createPost(formData).subscribe({
      next: () => {
        Swal.fire('Success', 'Post created successfully!', 'success');
        this.newPost = { title: '', description: '', image: '' };
        this.selectedImages = [];
        this.previewUrls = [];
        this.loadPosts?.(); // si usas loadPosts para refrescar el feed
      },
      error: () => {
        Swal.fire('Error', 'Something went wrong while creating the post.', 'error');
      }
    });
  }
  likePost(postId: number) {
    this.newsService.likePost(postId).subscribe(() => this.loadPosts());
  }


}
