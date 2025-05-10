<script setup lang="ts">
    import * as skinview3d from "skinview3d";
    import { ref, watch, onUnmounted } from "vue";
    import { uploadFileToAlist } from "./mods/AlistAPI";

    const stage = ref<number>(0);
    const file = ref<File | null>();
    const skinview = ref<HTMLCanvasElement | null>(null);
    const skinViewer = ref<skinview3d.SkinViewer | null>(null);
    const username = ref<string>("");
    const uploadStatus = ref<string>("");
    const uploadResult = ref<any>(null);
    const uploadError = ref<string>("");

    watch(file, (newFile) => {
        if (newFile && skinview.value) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result && skinview.value) {
                    if (!skinViewer.value) {
                        skinViewer.value = new skinview3d.SkinViewer({
                            canvas: skinview.value,
                            width: 512,
                            height: 512,
                            skin: URL.createObjectURL(newFile),
                        });
                        skinViewer.value.animation = new skinview3d.WalkingAnimation();
                    } else {
                        skinViewer.value.loadSkin(URL.createObjectURL(newFile));
                    }
                }
            };
            reader.readAsDataURL(newFile);
        }
    });

    onUnmounted(() => {
        if (skinViewer.value) {
            skinViewer.value.dispose();
        }
    });

    const handleChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        file.value = target.files?.[0];
    };

    const handleUpload = async () => {
        if (!file.value || !username.value) {
            uploadStatus.value = "请填写用户名并选择皮肤文件!";
            return;
        }

        stage.value = 2;
        uploadStatus.value = "正在上传...";
        uploadError.value = "";
        uploadResult.value = null;

        try {
            const [result, error] = await uploadFileToAlist(file.value, `${username.value}.png`);
            if (error) {
                uploadError.value = error;
                uploadStatus.value = error;
            } else {
                uploadResult.value = result;
                uploadStatus.value = "上传成功!";
                stage.value = 2;
            }
        } catch (err) {
            uploadError.value = err instanceof Error ? err.message : String(err);
            uploadStatus.value = "上传失败!";
        }
    };

    const handleCopy = async (username: string) => {
        try {
            await navigator.clipboard.writeText(
                `/skin set ${username} https://svbucqyh.eu-central-1.clawcloudrun.com/d/%E7%9A%AE%E8%82%A4%E5%B7%A5%E5%85%B7%E7%AE%B1/${username}.png`
            );
            const btn = document.querySelector(".copy-btn");
            if (btn) {
                btn.classList.add("btn-success");
                btn.textContent = "已复制";
                setTimeout(() => {
                    btn.classList.remove("btn-success");
                    btn.textContent = "复制";
                }, 2000);
            }
        } catch (err) {
            console.error("复制失败:", err);
        }
    };
</script>

<template>
    <main
        class="min-h-screen"
        style="
            background: linear-gradient(
                    to right,
                    color-mix(in srgb, var(--color-neutral) 50%, transparent 50%),
                    color-mix(in srgb, var(--color-neutral) 50%, transparent 50%)
                ),
                url(/bg.png);
        ">
        <Transition name="fade">
            <div class="hero min-h-screen" v-if="stage == 0">
                <div class="hero-content text-neutral-content text-center">
                    <div class="max-w-md">
                        <h1 class="mb-5 text-5xl font-bold">落颜 · SkinDrop</h1>
                        <p class="mb-5">
                            SkinDrop（落颜） 是一款轻量级皮肤上传与链接生成工具，专为 SkinsRestorer 插件
                            设计。通过简单拖放皮肤文件，即可一键生成可用于 SkinsRestorer
                            指令的公开链接与命令，极大简化服务器管理者与玩家的皮肤更换流程。
                        </p>
                        <button class="btn btn-primary" @click="stage = 1">开始使用</button>
                    </div>
                </div>
            </div>
        </Transition>
        <Transition name="fade">
            <div class="hero min-h-screen flex justify-around" v-if="stage == 1">
                <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                    <div class="card-body">
                        <fieldset class="fieldset">
                            <label class="label">Minecraft 用户名</label>
                            <input type="text" class="input w-full" v-model="username" />
                            <label class="label mt-4">皮肤文件</label>
                            <input type="file" class="file-input w-full" @change="(e) => handleChange(e)" />
                            <label class="label mt-4">托管服务</label>
                            <select class="select w-full" disabled>
                                <option selected value="nova-project-alist">Nova Project Alist</option>
                                <option value="mc521-alist">MC521 Alist</option>
                            </select>
                            <i class="divider" />
                            <button class="btn btn-primary" @click="handleUpload">上传</button>
                        </fieldset>
                    </div>
                </div>
                <canvas ref="skinview" class="bg-base-100 size-128" />
            </div>
        </Transition>
        <Transition name="fade">
            <div class="hero min-h-screen" v-if="stage == 2">
                <div class="hero-content text-center">
                    <div class="max-w-md">
                        <h2 class="text-2xl font-bold mb-4">上传状态</h2>
                        <div
                            v-if="uploadStatus"
                            class="alert mb-4 w-64"
                            :class="
                                uploadError
                                    ? 'alert-error!'
                                    : uploadStatus === '正在上传...'
                                    ? 'alert-warning'
                                    : 'alert-success!'
                            ">
                            <span v-if="uploadStatus === '正在上传...'">
                                <span class="loading loading-spinner"></span>
                                {{ uploadStatus }}
                            </span>
                            <span v-else>
                                {{ uploadStatus }}
                            </span>
                        </div>

                        <div v-if="uploadResult" class="shadow-xl flex gap-4 justify-center">
                            <button class="btn btn-primary copy-btn" @click="handleCopy(username)">复制换皮肤命令</button>
                            <button class="btn btn-neutral" @click="stage = 0">返回首页</button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </main>
</template>

<style>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.5s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }

    .fade-enter-to,
    .fade-leave-from {
        opacity: 1;
    }
</style>
