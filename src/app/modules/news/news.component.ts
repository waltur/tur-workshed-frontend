import { Component, OnInit } from '@angular/core';
import { NewsService } from './components/services/news.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
declare var bootstrap: any;
import Swal from 'sweetalert2';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  posts: any[] = [];
  mediaUrl = environment.mediaUrl;
  expandedPosts: Set<number> = new Set();
  selectedImageUrl: string = '';
  isLoggedIn = false;
  commentAttempted: boolean = false;
  selectedGalleryImages: string[] = [];
  selectedImageIndex = 0;

  // Para manejar inputs de respuesta por comentario (key: id_comment)
  replyTexts: { [key: number]: string } = {};
  replyingComments: Set<number> = new Set();

  constructor(private newsService: NewsService, private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadPosts();
  }
  handleCommentFocus() {
    if (!this.isLoggedIn) {
      this.commentAttempted = true;
    }
  }
  loadPosts() {
    this.newsService.getPosts().subscribe(data => {
      this.posts = data;
    });
  }

 /* likePost(postId: number) {
    this.newsService.likePost(postId).subscribe({
      next: (res: any) => {
        const post = this.posts.find(p => p.id_post === postId);
        if (post && res.likes != null) post.likes = res.likes;
      },
      error: (err) => console.error('Error liking post:', err)
    });
  }*/

likePost(postId: number) {
  this.newsService.likePost(postId).subscribe({
    next: res => {
      const post = this.posts.find(p => p.id_post === postId);
      if (post) {
        post.likes = res.likes;
        post.liked_by_me = true;
      }
    }
  });
}
  addComment(postId: number, comment: string, parentId?: number) {
    console.log("addComment");
    if (!comment) return;

    const id_contact = this.authService.getContactId();
    if (!id_contact) {
      console.error('No se encontró el id_contact del usuario');
      return;
    }

    this.newsService.addComment(postId, comment, id_contact, parentId).subscribe(() => {
      this.loadPosts();
      if (parentId) {
        this.replyTexts[parentId] = '';
        this.replyingComments.delete(parentId);
      }
    });
  }

  toggleComments(postId: number): void {
    if (this.expandedPosts.has(postId)) {
      this.expandedPosts.delete(postId);
    } else {
      this.expandedPosts.add(postId);
    }
  }

  openImage(imageName: string): void {
    this.selectedImageUrl = `${this.mediaUrl}/uploads/news/${imageName}`;
    const modalElement = document.getElementById('imageModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Mostrar/ocultar input respuesta por comentario
  toggleReplyInput(postId: number, commentId: number) {
    if (this.replyingComments.has(commentId)) {
      this.replyingComments.delete(commentId);
    } else {
      this.replyingComments.add(commentId);
    }
  }

  // Verifica si el input respuesta está visible
  isReplying(postId: number, commentId: number): boolean {
    return this.replyingComments.has(commentId);
  }

  // Enviar respuesta (reply) a comentario
  submitReply(postId: number, parentCommentId: number) {
    const replyText = this.replyTexts[parentCommentId];
    if (!replyText || !replyText.trim()) return;
    this.addComment(postId, replyText.trim(), parentCommentId);
  }
openGallery(images: string[], index: number) {
  this.selectedGalleryImages = images;
  this.selectedImageIndex = index;

  const modalEl = document.getElementById('galleryModal');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

nextImage() {
  if (this.selectedImageIndex < this.selectedGalleryImages.length - 1) {
    this.selectedImageIndex++;
  }
}

prevImage() {
  if (this.selectedImageIndex > 0) {
    this.selectedImageIndex--;
  }
}
}
